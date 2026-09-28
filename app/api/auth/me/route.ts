import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  decodeProtectedHeader,
} from "jose";

import sql from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import { getBearerAccessToken } from "@/lib/bearer-token";

export async function GET(
  request: NextRequest
) {
  try {
    const accessToken =
      getBearerAccessToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          authenticated: false,
          error:
            "Bearer access token missing",
        },
        { status: 401 }
      );
    }

    let payload;

    try {
      payload =
        await verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json(
        {
          authenticated: false,
          error:
            "Invalid or expired access token",
        },
        { status: 401 }
      );
    }

    if (!payload.sub) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Invalid token subject",
        },
        { status: 401 }
      );
    }

    const users = await sql`
      SELECT
        id,
        name,
        email
      FROM users
      WHERE id = ${payload.sub}
      LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "User not found",
        },
        { status: 401 }
      );
    }

    const header =
      decodeProtectedHeader(accessToken);

    return NextResponse.json({
      authenticated: true,

      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
      },

      jwt: {
        header,

        payload: {
          sub: payload.sub,
          name: payload.name,
          email: payload.email,
          tokenType: payload.tokenType,
          iat: payload.iat,
          exp: payload.exp,
          jti: payload.jti,
        },

        hasSignature: true,
      },
    });
  } catch (error) {
    console.error("/me error:", error);

    return NextResponse.json(
      {
        authenticated: false,
        error: "Authentication failed",
      },
      { status: 401 }
    );
  }
}