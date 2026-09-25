import { cookies } from "next/headers";
import postgres from "postgres";

import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} from "@/lib/jwt";

const sql = postgres(process.env.DATABASE_URL!);

export async function POST() {
  try {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return Response.json(
        { message: "Refresh token missing." },
        { status: 401 }
      );
    }

    const { payload } = await verifyRefreshToken(refreshToken);

    const jti = payload.jti;
    const email = payload.email;

    if (!jti || !email || !payload.sub) {
      return Response.json(
        { message: "Invalid refresh token." },
        { status: 401 }
      );
    }

    const storedTokens = await sql`
      SELECT jti, email, expires_at, revoked_at
      FROM refresh_tokens
      WHERE jti = ${jti}
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `;

    if (storedTokens.length === 0) {
      return Response.json(
        { message: "Refresh token is invalid or already used." },
        { status: 401 }
      );
    }

    const users = await sql`
      SELECT id, name, email
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (users.length === 0) {
      return Response.json(
        { message: "User not found." },
        { status: 401 }
      );
    }

    const user = users[0];

    const newAccessToken = await createAccessToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    const newRefreshToken = await createRefreshToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    await sql.begin(async (tx) => {
      const revoked = await tx`
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE jti = ${jti}
          AND revoked_at IS NULL
        RETURNING jti
      `;

      if (revoked.length === 0) {
        throw new Error("REFRESH_TOKEN_ALREADY_USED");
      }

      await tx`
        INSERT INTO refresh_tokens (
          jti,
          email,
          expires_at
        )
        VALUES (
          ${newRefreshToken.jti},
          ${user.email},
          ${new Date(newRefreshToken.expiresAt)}
        )
      `;
    });

    cookieStore.set("access_token", newAccessToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_TTL,
    });

    cookieStore.set("refresh_token", newRefreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return Response.json({
      success: true,
      accessTokenExpiresAt: newAccessToken.expiresAt,
      refreshTokenExpiresAt: newRefreshToken.expiresAt,
      rotated: true,
    });
  } catch (error) {
    console.error("Refresh error:", error);

    const cookieStore = await cookies();

    cookieStore.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    cookieStore.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return Response.json(
      { message: "Refresh token expired or invalid." },
      { status: 401 }
    );
  }
}