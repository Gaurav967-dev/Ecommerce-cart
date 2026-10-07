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
        "PATCH",
        "DELETE",
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

def cookie_options():
    return {
        "httponly": True,
        "secure": False,
        "samesite": "lax",
        "path": "/",
    }


def set_login_cookies(
    response: Response,
    access_token: str,
    refresh_token: str,
):
    # First login access token snapshot, not used for API authorization.
    response.set_cookie(
        key="id_token",
        value=access_token,
        max_age=REFRESH_TOKEN_TTL_SECONDS,
        **cookie_options(),
    )

    # Current API access token.
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_TTL_SECONDS,
        **cookie_options(),
    )

    # Long-lived refresh token.
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=REFRESH_TOKEN_TTL_SECONDS,
        **cookie_options(),
    )


def rotate_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: str,
):
    # Do NOT replace id_token here.
    # It represents the first token from login.

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_TTL_SECONDS,
        **cookie_options(),
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=REFRESH_TOKEN_TTL_SECONDS,
        **cookie_options(),
    )


def clear_auth_cookies(
    response: Response,
):
    for cookie_name in (
        "id_token",
        "access_token",
        "refresh_token",
    ):
        response.delete_cookie(
            key=cookie_name,
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

    set_login_cookies(
        response=response,
        access_token=access["token"],
        refresh_token=refresh["token"],
    )

    return {
        "success": True,

        "idToken": access["token"],

        "accessToken":
            access["token"],

        "refreshToken":
            refresh["token"],

        "accessTokenExpiresAt":
            access["expiresAt"] * 1000,

        "accessTokenExpiresIn":
            ACCESS_TOKEN_TTL_SECONDS,

        "refreshTokenExpiresAt":
            refresh["expiresAt"] * 1000,

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

    rotate_auth_cookies(
        response=response,
        access_token=new_access["token"],
        refresh_token=new_refresh["token"],
    )

    return {
        "success": True,

        "accessToken":
            new_access["token"],

        "refreshToken":
            refresh_token["token"],

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

    clear_auth_cookies(
        response
    )

    return {
        "success": True
    }

# Authorize using access_token

def get_access_token(
    request: Request,
    credentials: Optional[
        HTTPAuthorizationCredentials
    ] = Depends(bearer_scheme),
):
    # Prefer explicit Bearer authorization.
    if (
        credentials
        and credentials.scheme.lower()
        == "bearer"
    ):
        return {
            "token":
                credentials.credentials,

            "source":
                "bearer",
        }

    # Otherwise use HttpOnly cookie.
    cookie_token = (
        request.cookies.get(
            "access_token"
        )
    )

    if cookie_token:
        return {
            "token":
                cookie_token,

            "source":
                "cookie",
        }

    raise HTTPException(
        status_code=401,
        detail=
            "Access token missing",
    )

# Reusable Authentication Dependency

def require_user(
    auth=Depends(
        get_access_token
    )
):
    payload = decode_token(
        auth["token"],
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

    return {
        "user_id":
            user_id,

        "payload":
            payload,

        "auth_source":
            auth["source"],
    }

def get_cookie_access_token(
        request: Request
):
    access_token = (
        request.cookies.get(
            "access_token"
        )
    )

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail=
                "Access token cookie missing",
        )

    return access_token

def require_cookie_user(
        access_token: str = Depends(
            get_cookie_access_token
        )
):
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
                "Invalid token subject"
        )

    return {
        "user_id":
            user_id,

        "payload":
            payload,

        "auth_source":
            "access_token_cookie",
    }

# ME

@app.get("/auth/me")
def auth_me(
    auth=Depends(
        require_user
    )
):
    user_id = (
        auth["user_id"]
    )

    payload = (
        auth["payload"]
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

                    WHERE id = %s

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
            detail="User not found",
        )

    return {
        "authenticated": True,

        "authorization": {
            "source":
                auth["auth_source"],

            "tokenPresent":
                True,
        },

        "cookies": {
            "idToken":
                True,

            "accessToken":
                True,

            "refreshToken":
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
                payload.get("sub"),

            "jti":
                payload.get("jti"),

            "tokenType":
                payload.get(
                    "tokenType"
                ),

            "iat":
                payload.get("iat"),

            "exp":
                payload.get("exp"),

            "iss":
                payload.get("iss"),

            "aud":
                payload.get("aud"),
        },
    }

# Profile

class ProfileUpdateRequest(
    BaseModel
):
    name: str
    phone: str = ""


@app.get("/profile")
def get_profile(
    auth=Depends(
        require_cookie_user
    )
):
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

                    WHERE id = %s

                    LIMIT 1
                    """,
                    (
                        auth[
                            "user_id"
                        ],
                    ),
                )

                user = (
                    cursor.fetchone()
                )

    except Exception as error:
        print(
            "Profile GET error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=
                "Unable to load profile",
        )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return {
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
                user[
                    "created_at"
                ].isoformat()
                if user[
                    "created_at"
                ]
                else None,
        },
    }


@app.patch("/profile")
def update_profile(
    body:
        ProfileUpdateRequest,

    auth=Depends(
        require_cookie_user
    ),
):
    name = (
        body.name.strip()
    )

    phone = (
        body.phone.strip()
    )

    if not name:
        raise HTTPException(
            status_code=400,
            detail=
                "Name is required",
        )

    if len(name) > 100:
        raise HTTPException(
            status_code=400,
            detail=
                "Name is too long",
        )

    if (
        phone
        and len(phone) > 20
    ):
        raise HTTPException(
            status_code=400,
            detail=
                "Invalid phone number",
        )

    try:
        with psycopg.connect(
            DATABASE_URL,
            row_factory=dict_row,
        ) as connection:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    UPDATE users

                    SET
                        name = %s,
                        phone = %s

                    WHERE id = %s

                    RETURNING
                        id,
                        name,
                        email,
                        phone,
                        created_at
                    """,
                    (
                        name,
                        phone or None,
                        auth[
                            "user_id"
                        ],
                    ),
                )

                user = (
                    cursor.fetchone()
                )

    except Exception as error:
        print(
            "Profile PATCH error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=
                "Unable to update profile",
        )

    if not user:
        raise HTTPException(
            status_code=404,
            detail=
                "User not found",
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

            "phone":
                user["phone"]
                or "",

            "createdAt":
                user[
                    "created_at"
                ].isoformat()
                if user[
                    "created_at"
                ]
                else None,
        },
    }

# Orders

@app.get("/orders")
def get_orders(
    auth=Depends(
        require_cookie_user
    )
):
    try:
        with psycopg.connect(
            DATABASE_URL,
            row_factory=dict_row,
        ) as connection:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT
                        o.id,
                        o.order_number,
                        o.total_amount,
                        o.subtotal,
                        o.discount_amount,
                        o.shipping_fee,
                        o.tax_amount,
                        o.status,
                        o.payment_method,
                        o.payment_status,
                        o.created_at,

                        COUNT(
                            oi.id
                        )::INTEGER
                            AS item_count,

                        COALESCE(
                            json_agg(
                                json_build_object(
                                    'id',
                                        oi.id,

                                    'name',
                                        oi.product_name,

                                    'image',
                                        oi.product_image,

                                    'quantity',
                                        oi.quantity
                                )

                                ORDER BY
                                    oi.id
                            )
                            FILTER (
                                WHERE
                                    oi.id
                                    IS NOT NULL
                            ),

                            '[]'::json
                        )
                        AS preview_items

                    FROM orders o

                    LEFT JOIN
                        order_items oi

                        ON oi.order_id =
                            o.id

                    WHERE
                        o.user_id = %s

                    GROUP BY
                        o.id

                    ORDER BY
                        o.created_at
                        DESC
                    """,
                    (
                        auth[
                            "user_id"
                        ],
                    ),
                )

                orders = (
                    cursor.fetchall()
                )

    except Exception as error:
        print(
            "Orders error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=
                "Unable to load orders",
        )

    return {
        "orders":
            orders
    }

# Order Details

@app.get("/orders/{order_id}")
def get_order(
    order_id: int,
    auth=Depends(
        require_cookie_user
    ),
):
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
                        order_number,
                        subtotal,
                        discount_amount,
                        shipping_fee,
                        tax_amount,
                        total_amount,

                        status,

                        payment_method,
                        payment_status,

                        shipping_name,
                        shipping_phone,
                        shipping_address_line1,
                        shipping_address_line2,
                        shipping_city,
                        shipping_state,
                        shipping_postal_code,
                        shipping_country,

                        created_at,
                        updated_at

                    FROM orders

                    WHERE
                        id = %s
                        AND user_id = %s

                    LIMIT 1
                    """,
                    (
                        order_id,
                        auth[
                            "user_id"
                        ],
                    ),
                )

                order = (
                    cursor.fetchone()
                )

                if not order:
                    raise HTTPException(
                        status_code=404,
                        detail=
                            "Order not found",
                    )

                cursor.execute(
                    """
                    SELECT
                        id,
                        product_id,
                        product_name,
                        product_image,
                        quantity,
                        unit_price

                    FROM order_items

                    WHERE
                        order_id = %s

                    ORDER BY id
                    """,
                    (
                        order_id,
                    ),
                )

                items = (
                    cursor.fetchall()
                )

    except Exception:
        raise

    except Exception as error:
        print(
            "Order detail error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=
                "Unable to load order",
        )

    return {
        "order": {
            "id":
                str(order["id"]),

            "orderNumber":
                order[
                    "order_number"
                ],

            "subtotal":
                order["subtotal"],

            "discountAmount":
                order[
                    "discount_amount"
                ],

            "shippingFee":
                order[
                    "shipping_fee"
                ],

            "taxAmount":
                order[
                    "tax_amount"
                ],

            "totalAmount":
                order[
                    "total_amount"
                ],

            "status":
                order["status"],

            "paymentMethod":
                order[
                    "payment_method"
                ],

            "paymentStatus":
                order[
                    "payment_status"
                ],

            "createdAt":
                order[
                    "created_at"
                ],

            "updatedAt":
                order[
                    "updated_at"
                ],

            "shippingAddress": {
                "name":
                    order[
                        "shipping_name"
                    ],

                "phone":
                    order[
                        "shipping_phone"
                    ],

                "addressLine1":
                    order[
                        "shipping_address_line1"
                    ],

                "addressLine2":
                    order[
                        "shipping_address_line2"
                    ],

                "city":
                    order[
                        "shipping_city"
                    ],

                "state":
                    order[
                        "shipping_state"
                    ],

                "postalCode":
                    order[
                        "shipping_postal_code"
                    ],

                "country":
                    order[
                        "shipping_country"
                    ],
            },

            "items": [
                {
                    "id":
                        str(item["id"]),

                    "productId":
                    (
                        str(
                            item[
                                "product_id"
                            ]
                        )

                        if item[
                            "product_id"
                        ]

                        else None
                    ),

                    "productName":
                        item[
                            "product_name"
                        ],

                    "productImage":
                        item[
                            "product_image"
                        ],

                    "quantity":
                        int(
                            item[
                                "quantity"
                            ]
                        ),

                    "unitPrice":
                        item[
                            "unit_price"
                        ],
                }

                for item in items
            ],
        },
    }

# Addresses

class AddressRequest(BaseModel):
    label: str = "Home"
    recipientName: str
    phone: str
    addressLine1: str
    addressLine2: str = ""
    city: str
    state: str
    postalCode: str
    country: str = "India"
    isDefault: bool = False

@app.get("/addresses")
def get_addresses(
    auth=Depends(
        require_cookie_user
    )
):
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
                        label,
                        recipient_name,
                        phone,
                        address_line1,
                        address_line2,
                        city,
                        state,
                        postal_code,
                        country,
                        is_default,
                        created_at,
                        updated_at

                    FROM addresses

                    WHERE
                        user_id = %s

                    ORDER BY
                        is_default DESC,
                        created_at DESC
                    """,
                    (
                        auth["user_id"],
                    ),
                )

                addresses = (
                    cursor.fetchall()
                )

    except Exception as error:
        print(
            "Addresses GET error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=
                "Unable to load addresses",
        )

    return {
        "addresses":
            addresses
    }

@app.post(
    "/addresses",
    status_code=
        status.HTTP_201_CREATED,
)
def create_address(
    body: AddressRequest,
    auth=Depends(
        require_cookie_user
    ),
):
    label = (
        body.label.strip()
        or "Home"
    )

    recipient_name = (
        body.recipientName
        .strip()
    )

    phone = (
        body.phone.strip()
    )

    address_line1 = (
        body.addressLine1
        .strip()
    )

    address_line2 = (
        body.addressLine2
        .strip()
    )

    city = (
        body.city.strip()
    )

    state_name = (
        body.state.strip()
    )

    postal_code = (
        body.postalCode
        .strip()
    )

    country = (
        body.country.strip()
    )

    if (
        not recipient_name
        or not phone
        or not address_line1
        or not city
        or not state_name
        or not postal_code
        or not country
    ):
        raise HTTPException(
            status_code=400,
            detail=
                "Please complete all required address fields",
        )

    try:
        with psycopg.connect(
            DATABASE_URL,
            row_factory=dict_row,
        ) as connection:

            with connection.cursor() as cursor:

                # Lock user's current address rows.
                cursor.execute(
                    """
                    SELECT id
                    FROM addresses
                    WHERE user_id = %s
                    FOR UPDATE
                    """,
                    (
                        auth["user_id"],
                    ),
                )

                existing_addresses = (
                    cursor.fetchall()
                )

                final_is_default = (
                    body.isDefault
                    or len(
                        existing_addresses
                    ) == 0
                )

                if final_is_default:
                    cursor.execute(
                        """
                        UPDATE addresses

                        SET
                            is_default = FALSE,
                            updated_at = NOW()

                        WHERE
                            user_id = %s
                        """,
                        (
                            auth[
                                "user_id"
                            ],
                        ),
                    )

                cursor.execute(
                    """
                    INSERT INTO addresses (
                        user_id,
                        label,
                        recipient_name,
                        phone,
                        address_line1,
                        address_line2,
                        city,
                        state,
                        postal_code,
                        country,
                        is_default
                    )

                    VALUES (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )

                    RETURNING
                        id,
                        label,
                        recipient_name,
                        phone,
                        address_line1,
                        address_line2,
                        city,
                        state,
                        postal_code,
                        country,
                        is_default,
                        created_at,
                        updated_at
                    """,
                    (
                        auth[
                            "user_id"
                        ],
                        label,
                        recipient_name,
                        phone,
                        address_line1,
                        address_line2
                        or None,
                        city,
                        state_name,
                        postal_code,
                        country,
                        final_is_default,
                    ),
                )

                address = (
                    cursor.fetchone()
                )

    except Exception as error:
        print(
            "Address POST error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=
                "Unable to save address",
        )

    return {
        "success": True,
        "address":
            address,
    }

@app.patch(
    "/addresses/{address_id}"
)
def update_address(
    address_id: int,
    body: AddressRequest,
    auth=Depends(
        require_cookie_user
    ),
):
    label = (
        body.label.strip()
        or "Home"
    )

    recipient_name = (
        body.recipientName
        .strip()
    )

    phone = (
        body.phone.strip()
    )

    address_line1 = (
        body.addressLine1
        .strip()
    )

    address_line2 = (
        body.addressLine2
        .strip()
    )

    city = (
        body.city.strip()
    )

    state_name = (
        body.state.strip()
    )

    postal_code = (
        body.postalCode.strip()
    )

    country = (
        body.country.strip()
    )

    if (
        not recipient_name
        or not phone
        or not address_line1
        or not city
        or not state_name
        or not postal_code
        or not country
    ):
        raise HTTPException(
            status_code=400,
            detail=
                "Please complete all required address fields",
        )

    try:
        with psycopg.connect(
            DATABASE_URL,
            row_factory=dict_row,
        ) as connection:

            with connection.cursor() as cursor:

                # Verify ownership first.
                cursor.execute(
                    """
                    SELECT
                        id,
                        is_default

                    FROM addresses

                    WHERE
                        id = %s
                        AND user_id = %s

                    LIMIT 1

                    FOR UPDATE
                    """,
                    (
                        address_id,
                        auth[
                            "user_id"
                        ],
                    ),
                )

                existing = (
                    cursor.fetchone()
                )

                if not existing:
                    raise HTTPException(
                        status_code=404,
                        detail=
                            "Address not found",
                    )

                final_is_default = (
                    body.isDefault
                )

                replacement_id = None

                # User is unsetting their current default.
                if (
                    existing[
                        "is_default"
                    ]
                    and not
                    body.isDefault
                ):
                    cursor.execute(
                        """
                        SELECT id

                        FROM addresses

                        WHERE
                            user_id = %s
                            AND id <> %s

                        ORDER BY
                            created_at DESC

                        LIMIT 1

                        FOR UPDATE
                        """,
                        (
                            auth[
                                "user_id"
                            ],
                            address_id,
                        ),
                    )

                    replacement = (
                        cursor.fetchone()
                    )

                    if replacement:
                        replacement_id = (
                            replacement["id"]
                        )
                    else:
                        # Only saved address.
                        final_is_default = (
                            True
                        )

                # Becoming Default: remove default from others.
                if final_is_default:
                    cursor.execute(
                        """
                        UPDATE addresses

                        SET
                            is_default = FALSE,
                            updated_at = NOW()

                        WHERE
                            user_id = %s
                            AND id <> %s
                        """,
                        (
                            auth[
                                "user_id"
                            ],
                            address_id,
                        ),
                    )

                # Update current address first.
                cursor.execute(
                    """
                    UPDATE addresses

                    SET
                        label = %s,
                        recipient_name = %s,
                        phone = %s,
                        address_line1 = %s,
                        address_line2 = %s,
                        city = %s,
                        state = %s,
                        postal_code = %s,
                        country = %s,
                        is_default = %s,
                        updated_at = NOW()

                    WHERE
                        id = %s
                        AND user_id = %s

                    RETURNING
                        id,
                        label,
                        recipient_name,
                        phone,
                        address_line1,
                        address_line2,
                        city,
                        state,
                        postal_code,
                        country,
                        is_default,
                        created_at,
                        updated_at
                    """,
                    (
                        label,
                        recipient_name,
                        phone,
                        address_line1,
                        address_line2
                        or None,
                        city,
                        state_name,
                        postal_code,
                        country,
                        final_is_default,
                        address_id,
                        auth[
                            "user_id"
                        ],
                    ),
                )

                updated_address = (
                    cursor.fetchone()
                )

                # If old default was removed, make another saved address the new default.
                if replacement_id:
                    cursor.execute(
                        """
                        UPDATE addresses

                        SET
                            is_default = True,
                            updated_at = NOW()

                        WHERE
                            id = %s
                            AND user_id = %s
                        """,
                        (
                            replacement_id,
                            auth[
                                "user_id"
                            ],
                        ),
                    )

    except HTTPException:
        raise

    except Exception as error:
        print(
            "Address PATCH error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=
                "Unable to update address",
        )

    return {
        "success": True,

        "address":
            updated_address,
    }

@app.delete(
    "/addresses/{address_id}"
)
def delete_address(
    address_id: int,
    auth=Depends(
        require_cookie_user
    ),
):
    try:
        with psycopg.connect(
            DATABASE_URL,
            row_factory=dict_row,
        ) as connection:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    DELETE FROM addresses

                    WHERE
                        id = %s
                        AND user_id = %s

                    RETURNING
                        id,
                        is_default
                    """,
                    (
                        address_id,
                        auth[
                            "user_id"
                        ],
                    ),
                )

                deleted = (
                    cursor.fetchone()
                )

                if not deleted:
                    raise HTTPException(
                        status_code=404,
                        detail=
                            "Address not found",
                    )

                # Deleted default? Promote another address.
                if deleted[
                    "is_default"
                ]:
                    cursor.execute(
                        """
                        SELECT id

                        FROM addresses

                        WHERE
                            user_id = %s

                        ORDER BY
                            created_at DESC

                        LIMIT 1

                        FOR UPDATE
                        """,
                        (
                            auth[
                                "user_id"
                            ],
                        ),
                    )

                    replacement = (
                        cursor.fetchone()
                    )

                    if replacement:
                        cursor.execute(
                            """
                            UPDATE addresses

                            SET
                                is_default = TRUE,
                                updated_at = NOW()

                            WHERE
                                id = %s
                                AND user_id = %s
                            """,
                            (
                                replacement[
                                    "id"
                                ],
                                auth[
                                    "user_id"
                                ],
                            ),
                        )

    except HTTPException:
        raise

    except Exception as error:
        print(
            "Address DELETE error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=
                "Unable to delete address",
        )

    return {
        "success": True
    }