import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { randomUUID } from "crypto";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not configured");
}

const JWT_SECRET = new TextEncoder().encode(secret);

export const JWT_ISSUER = "ecommerce-cart";
export const JWT_AUDIENCE = "ecommerce-cart-users";

export const ACCESS_TOKEN_TTL = 60;
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

export type AuthTokenPayload = JWTPayload & {
  email: string;
  name: string;
  tokenType: "access" | "refresh";
};

type UserForToken = {
  id: number | string;
  name: string;
  email: string;
};

export async function createAccessToken(user: UserForToken) {
  const jti = randomUUID();

  const expiresAt = Date.now() + ACCESS_TOKEN_TTL * 1000;

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
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(JWT_SECRET);

  return {
    token,
    jti,
    expiresAt,
  };
}

export async function createRefreshToken(user: UserForToken) {
  const jti = randomUUID();

  const expiresAt = Date.now() + REFRESH_TOKEN_TTL * 1000;

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
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(JWT_SECRET);

  return {
    token,
    jti,
    expiresAt,
  };
}

export async function verifyAccessToken(token: string) {
  const result = await jwtVerify<AuthTokenPayload>(
    token,
    JWT_SECRET,
    {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"],
    }
  );

  if (result.payload.tokenType !== "access") {
    throw new Error("Invalid access token");
  }

  return result;
}

export async function verifyRefreshToken(token: string) {
  const result = await jwtVerify<AuthTokenPayload>(
    token,
    JWT_SECRET,
    {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"],
    }
  );

  if (result.payload.tokenType !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  return result;
}