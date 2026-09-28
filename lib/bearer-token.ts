import { ExtractJwt } from "passport-jwt";
import type { NextRequest } from "next/server";

const bearerExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();

export function getBearerAccessToken(request: NextRequest) {
  const compatibleRequest = {
    headers: Object.fromEntries(request.headers.entries()),
  };

  return bearerExtractor(compatibleRequest as any);
}