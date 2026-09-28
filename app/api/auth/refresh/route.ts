import {
  NextRequest,
  NextResponse,
} from "next/server";

import sql from "@/lib/db";

import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/lib/jwt";

export async function POST(
  request: NextRequest
) {
  try {
    const refreshToken =
      request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Refresh token missing",
        },
        { status: 401 }
      );
    }

    let payload;

    try {
      payload =
        await verifyRefreshToken(refreshToken);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid or expired refresh token",
        },
        { status: 401 }
      );
    }

    if (
      !payload.jti ||
      !payload.sub ||
      !payload.email
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid refresh token payload",
        },
        { status: 401 }
      );
    }

    const oldRefreshJti = payload.jti;
    const userId = payload.sub;
    const tokenEmail = payload.email;

    /* Check refresh token JTI in PostgreSQL */
    const tokens = await sql`
      SELECT
        jti,
        email,
        expires_at,
        revoked_at
      FROM refresh_tokens
      WHERE jti = ${payload.jti}
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `;

    if (!tokens[0]) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Refresh token revoked or expired",
        },
        { status: 401 }
      );
    }

    /*
     * Load current user.
     */
    const users = await sql`
      SELECT
        id,
        name,
        email
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 401 }
      );
    }

    /*
     * Generate brand-new access + refresh tokens.
     */
    const tokenUser = {
      id: String(user.id),
      name: user.name,
      email: user.email,
    };

    const newAccess =
      await createAccessToken(tokenUser);

    const newRefresh =
      await createRefreshToken(tokenUser);

    /*
     * Atomic refresh-token rotation.
     */
    await sql.begin(async (tx) => {
      const revoked = await tx`
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE jti = ${oldRefreshJti}
          AND revoked_at IS NULL
        RETURNING jti
      `;

      if (revoked.length !== 1) {
        throw new Error(
          "Refresh token already used"
        );
      }

      await tx`
        INSERT INTO refresh_tokens (
          jti,
          email,
          expires_at
        )
        VALUES (
          ${newRefresh.jti},
          ${user.email},
          ${
            new Date(
              newRefresh.expiresAt * 1000
            )
          }
        )
      `;
    });

    const response = NextResponse.json({
      success: true,

      accessToken: newAccess.token,

      accessTokenExpiresAt:
        newAccess.expiresAt * 1000,

      refreshTokenExpiresAt:
        newRefresh.expiresAt * 1000,

      accessTokenInfo: {
        jti: newAccess.jti,
        issuedAt: newAccess.issuedAt,
        expiresAt: newAccess.expiresAt,
      },

      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
      },
    });

    /*
     * Refresh token remains secret from JS.
     */
    response.cookies.set(
      "refresh_token",
      newRefresh.token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_TTL_SECONDS,
      }
    );

    /*
     * Delete legacy access cookie.
     */
    response.cookies.set("access_token", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);

    const response = NextResponse.json(
      {
        success: false,
        error: "Unable to refresh token",
      },
      { status: 401 }
    );

    response.cookies.set(
      "refresh_token",
      "",
      {
        httpOnly: true,
        path: "/",
        expires: new Date(0),
      }
    );

    return response;
  }
}