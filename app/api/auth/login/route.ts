import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import sql from "@/lib/db";
import { createAccessToken, createRefreshToken, ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT id, name, email, password FROM users
      WHERE LOWER(email) = ${email} LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const tokenUser = {
      id: String(user.id),
      name: user.name,
      email: user.email,
    };

    const access = await createAccessToken(tokenUser);
    const refresh = await createRefreshToken(tokenUser);

    await sql`
      INSERT INTO refresh_tokens (
        jti,
        email,
        expires_at
      )
      VALUES (
        ${refresh.jti},
        ${user.email},
        ${new Date(refresh.expiresAt * 1000)}
      )
    `;

    const response = NextResponse.json({
      success: true,

      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
      },

      accessToken: access.token,

      accessTokenExpiresAt: access.expiresAt * 1000,

      accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS,

      refreshTokenExpiresAt: refresh.expiresAt * 1000,
    });

    response.cookies.set(
      "refresh_token",
      refresh.token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_TTL_SECONDS,
      }
    );

    response.cookies.set("access_token", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to login",
      },
      { status: 500 }
    );
  }
}