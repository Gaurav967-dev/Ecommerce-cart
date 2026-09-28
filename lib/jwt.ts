import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const ACCESS_TOKEN_TTL_SECONDS = 2 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const ISSUER = "ecommerce-app";
const AUDIENCE = "ecommerce-user";

type TokenType = "access" | "refresh";

export type TokenUser = {
  id: string | number;
  name: string;
  email: string;
};

export interface AppJwtPayload extends JWTPayload {
  name: string;
  email: string;
  tokenType: TokenType;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function createAccessToken(user: TokenUser) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ACCESS_TOKEN_TTL_SECONDS;
  const jti = crypto.randomUUID();

  const token = await new SignJWT({
    name: user.name,
    email: user.email,
    tokenType: "access",
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(String(user.id))
    .setJti(jti)
    .setIssuedAt(now)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(exp)
    .sign(getJwtSecret());

  return {
    token,
    jti,
    issuedAt: now,
    expiresAt: exp,
  };
}

export async function createRefreshToken(user: TokenUser) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + REFRESH_TOKEN_TTL_SECONDS;
  const jti = crypto.randomUUID();

  const token = await new SignJWT({
    name: user.name,
    email: user.email,
    tokenType: "refresh",
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(String(user.id))
    .setJti(jti)
    .setIssuedAt(now)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(exp)
    .sign(getJwtSecret());

  return {
    token,
    jti,
    issuedAt: now,
    expiresAt: exp,
  };
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ["HS256"],
  });

  if (payload.tokenType !== "access") {
    throw new Error("Invalid access token");
  }

  return payload as AppJwtPayload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ["HS256"],
  });

  if (payload.tokenType !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  return payload as AppJwtPayload;
}