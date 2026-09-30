import os
from pathlib import Path

import jwt
import psycopg

from dotenv import load_dotenv
from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from jwt.exceptions import PyJWTError
from psycopg.rows import dict_row

# Load the same .env.local used by Next.js

ROOT_DIR = Path(__file__).resolve().parents[1]

load_dotenv(ROOT_DIR / ".env.local")


JWT_SECRET = os.getenv("JWT_SECRET")
DATABASE_URL = os.getenv("DATABASE_URL")

ISSUER = "ecommerce-app"
AUDIENCE = "ecommerce-user"

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not configured"
    )

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured"
    )

app = FastAPI(
    title="E-commerce Auth API"
)

# CORS

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    allow_credentials=False,

    allow_methods=[
        "GET",
        "OPTIONS",
    ],

    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)

bearer_scheme = HTTPBearer(
    auto_error=False
)

# AUTH / ME

@app.get("/auth/me")
def auth_me(
    credentials:
        HTTPAuthorizationCredentials
        | None = Depends(bearer_scheme),
):

    # No Authorization Bearer header
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer access token missing",
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme",
        )

    access_token = credentials.credentials

    # Verify JWT

    try:
        payload = jwt.decode(
            access_token,
            JWT_SECRET,
            algorithms=["HS256"],
            issuer=ISSUER,
            audience=AUDIENCE,
        )

    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )

    if payload.get("tokenType") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_sub = payload.get("sub")

    if not user_sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token subject missing",
        )

    try:
        user_id = int(user_sub)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )

    # Get current user from PostgreSQL

    with psycopg.connect(
        DATABASE_URL,
        row_factory=dict_row,
    ) as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT id, name, email, created_at FROM users
                WHERE id = %s LIMIT 1
                """,
                (user_id,),
            )

            user = cursor.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Response

    return {
        "authenticated": True,

        "authorization": {
            "scheme": "Bearer",
            "tokenPresent": True,
        },

        "user": {
            "id": str(user["id"]),
            "name": user["name"],
            "email": user["email"],
            "createdAt" : (
                user["created_at"].isoformat()
                if user["created_at"]
                else None
            ),
        },

        "jwt": {
            "sub": payload.get("sub"),
            "jti": payload.get("jti"),
            "tokenType": payload.get(
                "tokenType"
            ),
            "iat": payload.get("iat"),
            "exp": payload.get("exp"),
        },
    }