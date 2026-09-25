import { cookies } from "next/headers";

import {
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return Response.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { payload, protectedHeader } =
      await verifyAccessToken(accessToken);

    let refreshTokenExpiresAt: number | null = null;

    const refreshToken =
      cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
      try {
        const refreshResult =
          await verifyRefreshToken(refreshToken);

        refreshTokenExpiresAt =
          refreshResult.payload.exp
            ? refreshResult.payload.exp * 1000
            : null;
      } catch {
        refreshTokenExpiresAt = null;
      }
    }

    return Response.json({
      authenticated: true,

      user: {
        id: String(payload.sub),
        name: payload.name,
        email: payload.email,
      },

      accessTokenExpiresAt: payload.exp
        ? payload.exp * 1000
        : null,

      refreshTokenExpiresAt,

      jwt: {
        header: protectedHeader,

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
  } catch {
    return Response.json(
      {
        authenticated: false,
        message: "Access token expired or invalid.",
      },
      { status: 401 }
    );
  }
}