import os
from pathlib import Path

import jwt
import psycopg

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
# from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import PyJWTError
from psycopg.rows import dict_row


PROJECT_ROOT = Path(__file__).resolve().parents[1]

load_dotenv(PROJECT_ROOT / ".env.local")


JWT_SECRET = os.getenv("JWT_SECRET")
DATABASE_URL = os.getenv("DATABASE_URL")


if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not configured"
    )

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured"
    )


JWT_ISSUER = "ecommerce-app"
JWT_AUDIENCE = "ecommerce-user"
JWT_ALGORITHM = "HS256"


app = FastAPI(
    title="Ecommerce Python Auth API",
    version="1.0.0",
)


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#     ],
#     allow_credentials=False,
#     allow_methods=[
#         "GET",
#         "OPTIONS",
#     ],
#     allow_headers=[
#         "Authorization",
#         "Content-Type",
#     ],
# )


bearer_scheme = HTTPBearer(
    auto_error=False
)


@app.get("/")
def root():
    return {
        "service":
            "Ecommerce Python Auth API",
        "status":
            "running",
    }


@app.get("/auth/me")
def auth_me(
    credentials:
        HTTPAuthorizationCredentials
        | None = Depends(bearer_scheme)
):

    # 1. Check Bearer header
    if credentials is None:
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,
            detail=
                "Bearer access token missing",
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,
            detail=
                "Invalid authorization scheme",
        )


    access_token = credentials.credentials


    # 2. Verify JWT
    try:
        payload = jwt.decode(
            access_token,
            JWT_SECRET,
            algorithms=[
                JWT_ALGORITHM
            ],
            issuer=
                JWT_ISSUER,
            audience=
                JWT_AUDIENCE,
        )

    except PyJWTError as error:
        print(
            "JWT verification failed:",
            error
        )

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,
            detail=
                "Invalid or expired access token",
        )


    # 3. Only accept ACCESS tokens
    if payload.get("tokenType") != "access":
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,
            detail=
                "Invalid token type",
        )


    # 4. User ID comes from VERIFIED sub
    user_sub = payload.get("sub")

    if not user_sub:
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,
            detail=
                "Token subject missing",
        )


    try:
        user_id = int(user_sub)

    except (TypeError, ValueError):
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,
            detail=
                "Invalid token subject",
        )


    # 5. Fetch current user from PostgreSQL
    try:
        with psycopg.connect(
            DATABASE_URL,
            row_factory=dict_row,
        ) as connection:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT id, name, email, phone, created_at
                    FROM users
                    WHERE id = %s
                    LIMIT 1
                    """,
                    (user_id,),
                )

                user = cursor.fetchone()

    except Exception as error:
        print(
            "Database error:",
            error
        )

        raise HTTPException(
            status_code=
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=
                "Unable to load user",
        )


    if not user:
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,
            detail=
                "User not found",
        )


    # 6. Response
    return {
        "authenticated": True,
    
        "authorization": {
            "scheme": credentials.scheme,
            "tokenPresent": True,

            "accessToken": access_token,
        },
    
        "user": {
            "id": str(user["id"]),
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"] or "",
    
            "createdAt": (
                user["created_at"].isoformat()
                if user["created_at"]
                else None
            ),
        },
    
        "jwt": {
            "sub": payload.get("sub"),
            "name": payload.get("name"),
            "email": payload.get("email"),
            "tokenType": payload.get("tokenType"),
            "jti": payload.get("jti"),
            "iat": payload.get("iat"),
            "exp": payload.get("exp"),
            "iss": payload.get("iss"),
            "aud": payload.get("aud"),
        },
    }