import os
import time
import uuid

from pathlib import Path
from typing import Optional

import bcrypt
import jwt
import psycopg

from dotenv import load_dotenv

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Request,
    Response,
    status,
)

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from jwt.exceptions import PyJWTError

from pydantic import BaseModel

from psycopg.rows import dict_row


# ENVIRONMENT

PROJECT_ROOT = (
    Path(__file__).resolve().parents[1]
)

load_dotenv(
    PROJECT_ROOT / ".env.local"
)

JWT_SECRET = os.getenv(
    "JWT_SECRET"
)

DATABASE_URL = os.getenv(
    "DATABASE_URL"
)

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not configured"
    )

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured"
    )


# JWT SETTINGS

JWT_ISSUER = "ecommerce-app"
JWT_AUDIENCE = "ecommerce-user"
JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_TTL_SECONDS = (
    2 * 60
)

REFRESH_TOKEN_TTL_SECONDS = (
    7 * 24 * 60 * 60
)

app = FastAPI(
    title="Ecommerce Auth API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    allow_credentials=True,

    allow_methods=[
        "GET",
        "POST",
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

class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

def create_token(
    *,
    user_id: str,
    name: str,
    email: str,
    token_type: str,
    ttl_seconds: int,
):
    now = int(
        time.time()
    )

    expires_at = (
        now +
        ttl_seconds
    )

    jti = str(
        uuid.uuid4()
    )

    payload = {
        "sub": str(
            user_id
        ),

        "name": name,

        "email": email,

        "tokenType":
            token_type,

        "jti": jti,

        "iat": now,

        "exp":
            expires_at,

        "iss":
            JWT_ISSUER,

        "aud":
            JWT_AUDIENCE,
    }

    token = jwt.encode(
        payload,

        JWT_SECRET,

        algorithm=
            JWT_ALGORITHM,
    )

    return {
        "token": token,

        "jti": jti,

        "issuedAt": now,

        "expiresAt":
            expires_at,
    }


def create_access_token(
    user
):
    return create_token(
        user_id=
            str(user["id"]),

        name=
            user["name"],

        email=
            user["email"],

        token_type=
            "access",

        ttl_seconds=
            ACCESS_TOKEN_TTL_SECONDS,
    )


def create_refresh_token(
    user
):
    return create_token(
        user_id=
            str(user["id"]),

        name=
            user["name"],

        email=
            user["email"],

        token_type=
            "refresh",

        ttl_seconds=
            REFRESH_TOKEN_TTL_SECONDS,
    )


def decode_token(
    token: str,
    expected_type: str,
):
    try:
        payload = jwt.decode(
            token,

            JWT_SECRET,

            algorithms=[
                JWT_ALGORITHM
            ],

            issuer=
                JWT_ISSUER,

            audience=
                JWT_AUDIENCE,
        )

    except PyJWTError:
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid or expired token",
        )

    if (
        payload.get(
            "tokenType"
        )
        != expected_type
    ):
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid token type",
        )

    return payload

# COOKIE HELPERS

def set_refresh_cookie(
    response: Response,
    token: str,
):
    response.set_cookie(
        key=
            "refresh_token",

        value=
            token,

        httponly=True,

        secure=False,

        samesite="lax",

        path="/",

        max_age=
            REFRESH_TOKEN_TTL_SECONDS,
    )


def clear_refresh_cookie(
    response: Response
):
    response.delete_cookie(
        key=
            "refresh_token",

        path="/",
    )

# ROOT

@app.get("/")
def root():
    return {
        "service":
            "Ecommerce Python Auth API",

        "status":
            "running",
    }


# SIGNUP

@app.post("/auth/signup")
def signup(
    body: SignupRequest
):
    name = (
        body.name
        .strip()
    )

    email = (
        body.email
        .strip()
        .lower()
    )

    password = (
        body.password
    )

    if len(name) < 2:
        raise HTTPException(
            status_code=400,

            detail=
                "Name must be at least 2 characters",
        )

    if (
        "@" not in email
    ):
        raise HTTPException(
            status_code=400,

            detail=
                "Invalid email",
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=400,

            detail=
                "Password must be at least 6 characters",
        )

    hashed_password = (
        bcrypt.hashpw(
            password.encode(
                "utf-8"
            ),

            bcrypt.gensalt(),
        )
        .decode("utf-8")
    )

    try:
        with psycopg.connect(
            DATABASE_URL,

            row_factory=dict_row,
        ) as connection:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT id
                    FROM users
                    WHERE LOWER(email) = %s
                    LIMIT 1
                    """,
                    (email,),
                )

                if cursor.fetchone():
                    raise HTTPException(
                        status_code=409,

                        detail=
                            "An account with this email already exists",
                    )

                cursor.execute(
                    """
                    INSERT INTO users (
                        name,
                        email,
                        password
                    )
                    VALUES (
                        %s,
                        %s,
                        %s
                    )
                    RETURNING
                        id,
                        name,
                        email
                    """,
                    (
                        name,
                        email,
                        hashed_password,
                    ),
                )

                user = (
                    cursor.fetchone()
                )

    except HTTPException:
        raise

    except Exception as error:
        print(
            "Signup error:",
            error
        )

        raise HTTPException(
            status_code=500,

            detail=
                "Unable to create account",
        )

    return {
        "success": True,

        "user": {
            "id":
                str(user["id"]),

            "name":
                user["name"],

            "email":
                user["email"],
        },
    }


# LOGIN

@app.post("/auth/login")
def login(
    body: LoginRequest,
    response: Response,
):
    email = (
        body.email
        .strip()
        .lower()
    )

    password = (
        body.password
    )

    if (
        not email or
        not password
    ):
        raise HTTPException(
            status_code=400,

            detail=
                "Email and password are required",
        )

    try:
        with psycopg.connect(
            DATABASE_URL,

            row_factory=dict_row,
        ) as connection:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        name,
                        email,
                        password

                    FROM users

                    WHERE
                        LOWER(email) = %s

                    LIMIT 1
                    """,
                    (email,),
                )

                user = (
                    cursor.fetchone()
                )

                if not user:
                    raise HTTPException(
                        status_code=401,

                        detail=
                            "Invalid email or password",
                    )

                password_valid = (
                    bcrypt.checkpw(
                        password.encode(
                            "utf-8"
                        ),

                        user[
                            "password"
                        ].encode(
                            "utf-8"
                        ),
                    )
                )

                if not password_valid:
                    raise HTTPException(
                        status_code=401,

                        detail=
                            "Invalid email or password",
                    )

                access = (
                    create_access_token(
                        user
                    )
                )

                refresh = (
                    create_refresh_token(
                        user
                    )
                )

                cursor.execute(
                    """
                    INSERT INTO refresh_tokens (
                        jti,
                        email,
                        expires_at
                    )

                    VALUES (
                        %s,
                        %s,
                        to_timestamp(%s)
                    )
                    """,
                    (
                        refresh["jti"],
                        user["email"],
                        refresh[
                            "expiresAt"
                        ],
                    ),
                )

    except HTTPException:
        raise

    except Exception as error:
        print(
            "Login error:",
            error
        )

        raise HTTPException(
            status_code=500,

            detail=
                "Unable to login",
        )

    set_refresh_cookie(
        response,
        refresh["token"],
    )

    return {
        "success": True,

        "accessToken":
            access["token"],

        "accessTokenExpiresAt":
            access[
                "expiresAt"
            ] * 1000,

        "accessTokenExpiresIn":
            ACCESS_TOKEN_TTL_SECONDS,

        "refreshTokenExpiresAt":
            refresh[
                "expiresAt"
            ] * 1000,

        "user": {
            "id":
                str(user["id"]),

            "name":
                user["name"],

            "email":
                user["email"],
        },
    }

# REFRESH

@app.post("/auth/refresh")
def refresh(
    request: Request,
    response: Response,
):
    refresh_token = (
        request.cookies.get(
            "refresh_token"
        )
    )

    if not refresh_token:
        raise HTTPException(
            status_code=401,

            detail=
                "Refresh token missing",
        )

    payload = decode_token(
        refresh_token,
        "refresh",
    )

    jti = payload.get(
        "jti"
    )

    user_sub = payload.get(
        "sub"
    )

    if (
        not jti or
        not user_sub
    ):
        raise HTTPException(
            status_code=401,

            detail=
                "Invalid refresh token payload",
        )

    try:
        user_id = int(
            user_sub
        )

    except (
        TypeError,
        ValueError,
    ):
        raise HTTPException(
            status_code=401,

            detail=
                "Invalid refresh token subject",
        )

    try:
        with psycopg.connect(
            DATABASE_URL,

            row_factory=dict_row,
        ) as connection:

            with connection.cursor() as cursor:

                # Verify refresh token is still active.
                cursor.execute(
                    """
                    SELECT
                        jti

                    FROM refresh_tokens

                    WHERE
                        jti = %s

                        AND revoked_at
                            IS NULL

                        AND expires_at
                            > NOW()

                    LIMIT 1

                    FOR UPDATE
                    """,
                    (jti,),
                )

                active_token = (
                    cursor.fetchone()
                )

                if not active_token:
                    raise HTTPException(
                        status_code=401,

                        detail=
                            "Refresh token revoked or expired",
                    )

                cursor.execute(
                    """
                    SELECT
                        id,
                        name,
                        email

                    FROM users

                    WHERE
                        id = %s

                    LIMIT 1
                    """,
                    (user_id,),
                )

                user = (
                    cursor.fetchone()
                )

                if not user:
                    raise HTTPException(
                        status_code=401,

                        detail=
                            "User not found",
                    )

                new_access = (
                    create_access_token(
                        user
                    )
                )

                new_refresh = (
                    create_refresh_token(
                        user
                    )
                )

                # Revoke old refresh JTI.
                cursor.execute(
                    """
                    UPDATE refresh_tokens

                    SET
                        revoked_at =
                            NOW()

                    WHERE
                        jti = %s

                        AND revoked_at
                            IS NULL

                    RETURNING jti
                    """,
                    (jti,),
                )

                revoked = (
                    cursor.fetchone()
                )

                if not revoked:
                    raise HTTPException(
                        status_code=401,

                        detail=
                            "Refresh token already used",
                    )

                # Save newly rotated JTI.
                cursor.execute(
                    """
                    INSERT INTO refresh_tokens (
                        jti,
                        email,
                        expires_at
                    )

                    VALUES (
                        %s,
                        %s,
                        to_timestamp(%s)
                    )
                    """,
                    (
                        new_refresh[
                            "jti"
                        ],

                        user["email"],

                        new_refresh[
                            "expiresAt"
                        ],
                    ),
                )

    except HTTPException:
        raise

    except Exception as error:
        print(
            "Refresh error:",
            error
        )

        raise HTTPException(
            status_code=401,

            detail=
                "Unable to refresh token",
        )

    set_refresh_cookie(
        response,
        new_refresh["token"],
    )

    return {
        "success": True,

        "accessToken":
            new_access["token"],

        "accessTokenExpiresAt":
            new_access[
                "expiresAt"
            ] * 1000,

        "refreshTokenExpiresAt":
            new_refresh[
                "expiresAt"
            ] * 1000,

        "accessTokenInfo": {
            "jti":
                new_access[
                    "jti"
                ],

            "issuedAt":
                new_access[
                    "issuedAt"
                ],

            "expiresAt":
                new_access[
                    "expiresAt"
                ],
        },

        "user": {
            "id":
                str(user["id"]),

            "name":
                user["name"],

            "email":
                user["email"],
        },
    }


# LOGOUT

@app.post("/auth/logout")
def logout(
    request: Request,
    response: Response,
):
    refresh_token = (
        request.cookies.get(
            "refresh_token"
        )
    )

    if refresh_token:
        try:
            payload = (
                decode_token(
                    refresh_token,
                    "refresh",
                )
            )

            jti = payload.get(
                "jti"
            )

            if jti:
                with psycopg.connect(
                    DATABASE_URL
                ) as connection:

                    with connection.cursor() as cursor:

                        cursor.execute(
                            """
                            UPDATE refresh_tokens

                            SET
                                revoked_at =
                                    NOW()

                            WHERE
                                jti = %s

                                AND revoked_at
                                    IS NULL
                            """,
                            (jti,),
                        )

        except Exception:
            # Invalid/expired token should not prevent logout.
            pass

    clear_refresh_cookie(
        response
    )

    return {
        "success": True
    }

# ME

@app.get("/auth/me")
def auth_me(
    credentials:
        Optional[
            HTTPAuthorizationCredentials
        ]
        = Depends(
            bearer_scheme
        )
):
    if credentials is None:
        raise HTTPException(
            status_code=401,

            detail=
                "Bearer access token missing",
        )

    if (
        credentials.scheme.lower()
        != "bearer"
    ):
        raise HTTPException(
            status_code=401,

            detail=
                "Invalid authorization scheme",
        )

    access_token = (
        credentials.credentials
    )

    payload = decode_token(
        access_token,
        "access",
    )

    user_sub = (
        payload.get("sub")
    )

    if not user_sub:
        raise HTTPException(
            status_code=401,

            detail=
                "Token subject missing",
        )

    try:
        user_id = int(
            user_sub
        )

    except (
        TypeError,
        ValueError,
    ):
        raise HTTPException(
            status_code=401,

            detail=
                "Invalid token subject",
        )

    try:
        with psycopg.connect(
            DATABASE_URL,

            row_factory=dict_row,
        ) as connection:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT
                        id,
                        name,
                        email,
                        phone,
                        created_at

                    FROM users

                    WHERE
                        id = %s

                    LIMIT 1
                    """,
                    (user_id,),
                )

                user = (
                    cursor.fetchone()
                )

    except Exception as error:
        print(
            "Database error:",
            error
        )

        raise HTTPException(
            status_code=500,

            detail=
                "Unable to load user",
        )

    if not user:
        raise HTTPException(
            status_code=401,

            detail=
                "User not found",
        )

    return {
        "authenticated": True,

        "authorization": {
            "scheme":
                credentials.scheme,

            "tokenPresent":
                True,
        },

        "user": {
            "id":
                str(user["id"]),

            "name":
                user["name"],

            "email":
                user["email"],

            "phone":
                user["phone"]
                or "",

            "createdAt":
                (
                    user[
                        "created_at"
                    ].isoformat()

                    if user[
                        "created_at"
                    ]

                    else None
                ),
        },

        "jwt": {
            "sub":
                payload.get(
                    "sub"
                ),

            "name":
                payload.get(
                    "name"
                ),

            "email":
                payload.get(
                    "email"
                ),

            "tokenType":
                payload.get(
                    "tokenType"
                ),

            "jti":
                payload.get(
                    "jti"
                ),

            "iat":
                payload.get(
                    "iat"
                ),

            "exp":
                payload.get(
                    "exp"
                ),

            "iss":
                payload.get(
                    "iss"
                ),

            "aud":
                payload.get(
                    "aud"
                ),
        },
    }