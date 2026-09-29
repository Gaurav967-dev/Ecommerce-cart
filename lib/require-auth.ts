import type { NextRequest } from "next/server";

import { getBearerAccessToken } from "@/lib/bearer-token";
import { verifyAccessToken } from "@/lib/jwt";

export async function requireAuth(request: NextRequest) {
  const token = getBearerAccessToken(request);

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    const payload = await verifyAccessToken(token);

    if (!payload.sub) {
      throw new Error("UNAUTHORIZED");
    }

    return {
      userId: payload.sub,
      name: payload.name,
      email: payload.email,
      token: payload,
    };
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}