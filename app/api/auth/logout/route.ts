import { NextRequest, NextResponse } from "next/server";

import sql from "@/lib/db";
import { verifyRefreshToken } from "@/lib/jwt";

export async function POST(
  request: NextRequest
) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (refreshToken) {
    try {
      const payload = await verifyRefreshToken(refreshToken);

      if (payload.jti) {
        await sql`
          UPDATE refresh_tokens SET revoked_at = NOW()
          WHERE jti = ${payload.jti} AND revoked_at IS NULL
        `;
      }
    } catch {
      /* Even if token is invalid/expired, still clear browser cookies. */
    }
  }

  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set(
    "refresh_token",
    "",
    {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    }
  );

  response.cookies.set(
    "access_token",
    "",
    {
      httpOnly: true,
      path: "/",
      expires: new Date(0),
    }
  );

  return response;
}