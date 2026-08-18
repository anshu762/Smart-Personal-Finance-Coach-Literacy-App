import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET && process.env.NODE_ENV !== "test") {
  console.warn(
    "⚠️  JWT_SECRET is not set. Using an insecure development secret.",
  );
}

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-insecure-secret-change-me";
const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface TokenPayload {
  userId: string;
  email: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}