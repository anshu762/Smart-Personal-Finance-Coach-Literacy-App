import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  type TokenPayload,
} from "../../utils/jwt";
import { AppError } from "../../middleware/error.middleware";
import type { LoginInput, SignupInput } from "./auth.schema";

const BCRYPT_ROUNDS = 12;

function publicUser(user: {
  id: string;
  name: string;
  email: string;
}) {
  return { id: user.id, name: user.name, email: user.email };
}

function buildTokenPair(user: { id: string; email: string }) {
  const payload: TokenPayload = { userId: user.id, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function signup(input: SignupInput) {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
      select: { id: true, name: true, email: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        409,
        "An account with this email already exists",
        "EMAIL_TAKEN",
      );
    }
    throw error;
  }

  return { user: publicUser(user), ...buildTokenPair(user) };
}

export async function login(input: LoginInput) {
  const account = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  const passwordValid =
    account && (await bcrypt.compare(input.password, account.passwordHash));

  if (!account || !passwordValid) {
    throw new AppError(
      401,
      "Invalid email or password",
      "INVALID_CREDENTIALS",
    );
  }

  const user = publicUser(account);
  return { user, ...buildTokenPair(user) };
}

export function refresh(refreshToken: string) {
  let payload: TokenPayload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    throw new AppError(
      401,
      "Invalid or expired refresh token",
      "INVALID_REFRESH_TOKEN",
    );
  }

  return {
    user: { id: payload.userId, email: payload.email },
    accessToken: signAccessToken({
      userId: payload.userId,
      email: payload.email,
    }),
    refreshToken: signRefreshToken({
      userId: payload.userId,
      email: payload.email,
    }),
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return user;
}