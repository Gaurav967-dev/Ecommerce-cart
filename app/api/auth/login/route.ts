import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { z } from "zod";

import {
  createAccessToken,
  createRefreshToken,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} from "@/lib/jwt";

const sql = postgres(process.env.DATABASE_URL!);

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { message: "Invalid email or password." },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    const normalizedEmail = email.toLowerCase().trim();

    const users = await sql`
      SELECT id, name, email, password
      FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `;

    if (users.length === 0) {
      return Response.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = users[0];

    const passwordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordValid) {
      return Response.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const accessToken = await createAccessToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    const refreshToken = await createRefreshToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    await sql`
      INSERT INTO refresh_tokens (
        jti,
        email,
        expires_at
      )
      VALUES (
        ${refreshToken.jti},
        ${user.email},
        ${new Date(refreshToken.expiresAt)}
      )
    `;

    const cookieStore = await cookies();

    cookieStore.set("access_token", accessToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_TTL,
    });

    cookieStore.set("refresh_token", refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return Response.json({
      success: true,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
      },
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
    });
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      { message: "Something went wrong while signing in." },
      { status: 500 }
    );
  }
}