import { cookies } from "next/headers";
import postgres from "postgres";

import { verifyRefreshToken } from "@/lib/jwt";

const sql = postgres(process.env.DATABASE_URL!);

export async function POST() {
  const cookieStore = await cookies();

  const refreshToken =
    cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    try {
      const { payload } =
        await verifyRefreshToken(refreshToken);

      if (payload.jti) {
        await sql`
          UPDATE refresh_tokens
          SET revoked_at = NOW()
          WHERE jti = ${payload.jti}
            AND revoked_at IS NULL
        `;
      }
    } catch {
      // Token may already be expired.
    }
  }

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

  return Response.json({
    success: true,
  });
}