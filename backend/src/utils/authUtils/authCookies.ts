import jwt, { type JwtPayload } from "jsonwebtoken";
import crypto from "node:crypto";
import type { CookieOptions, Response } from "express";
import redis from "../../config/redis.js";
import { env } from "../../config/env.js";
import { errors } from "../errors.js";

/*
  Session model (Redis):
    sessionId:<sid>         → userId           (TTL = refresh lifetime)
    refreshTokenHash:<sid>  → sha256(token)    (TTL = refresh lifetime)
    user_sessions:<userId>  → set of sids      (lets us "log out everywhere")

  Browser holds two httpOnly cookies: sessionId + refreshToken.
  The short-lived access token lives only in React memory.
*/

const REFRESH_TTL_SECONDS = env.refreshTokenDays * 24 * 60 * 60;

const keys = {
  session: (sessionId: string) => `sessionId:${sessionId}`,
  refreshHash: (sessionId: string) => `refreshTokenHash:${sessionId}`,
  userSessions: (userId: string) => `user_sessions:${userId}`,
};

interface TokenPayload extends JwtPayload {
  userId: string;
}

export const signAccessToken = (userId: string) =>
  jwt.sign({ userId }, env.accessTokenSecret, {
    expiresIn: env.accessTokenMinutes * 60,
  });

export const verifyAccessToken = (accessToken: string) =>
  jwt.verify(accessToken, env.accessTokenSecret) as TokenPayload;

export const generateHashedToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateRefreshToken = () => crypto.randomBytes(32).toString("hex");

// Constant-time comparison to avoid timing leaks.
const hashesMatch = (a: string, b: string) => {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProd || env.cookieSameSite === "none",
  sameSite: env.cookieSameSite,
  path: "/api/auth",
};

const setAuthCookies = (
  res: Response,
  sessionId: string,
  refreshToken: string,
) => {
  const options = { ...baseCookieOptions, maxAge: REFRESH_TTL_SECONDS * 1000 };
  res.cookie("sessionId", sessionId, options);
  res.cookie("refreshToken", refreshToken, options);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("sessionId", baseCookieOptions);
  res.clearCookie("refreshToken", baseCookieOptions);
};

export const createSession = async (res: Response, userId: string) => {
  const sessionId = crypto.randomUUID();
  const refreshToken = generateRefreshToken();

  await redis
    .multi()
    .set(keys.session(sessionId), userId, { ex: REFRESH_TTL_SECONDS })
    .set(keys.refreshHash(sessionId), generateHashedToken(refreshToken), {
      ex: REFRESH_TTL_SECONDS,
    })
    .sadd(keys.userSessions(userId), sessionId)
    .expire(keys.userSessions(userId), REFRESH_TTL_SECONDS)
    .exec();

  setAuthCookies(res, sessionId, refreshToken);
  return { accessToken: signAccessToken(userId), sessionId };
};

/**
 * Validates the presented refresh token and swaps it for a new one.
 * The session id stays the same; only the token rotates.
 * Returns the userId the session belongs to.
 */
export const rotateSession = async (
  res: Response,
  sessionId: string,
  presentedToken: string,
) => {
  const [userId, storedHash] = await Promise.all([
    redis.get<string>(keys.session(sessionId)),
    redis.getdel<string>(keys.refreshHash(sessionId)),
  ]);

  if (!userId || !storedHash) {
    clearAuthCookies(res);
    throw errors.sessionExpired();
  }

  if (!hashesMatch(storedHash, generateHashedToken(presentedToken))) {
    // Reuse of a rotated token signals theft: revoke the whole session.
    await destroySession(sessionId);
    clearAuthCookies(res);
    throw errors.invalidToken();
  }

  const newRefreshToken = generateRefreshToken();
  await redis
    .multi()
    .set(keys.refreshHash(sessionId), generateHashedToken(newRefreshToken), {
      ex: REFRESH_TTL_SECONDS,
    })
    .expire(keys.session(sessionId), REFRESH_TTL_SECONDS)
    .expire(keys.userSessions(userId), REFRESH_TTL_SECONDS)
    .exec();

  setAuthCookies(res, sessionId, newRefreshToken);
  return { userId, accessToken: signAccessToken(userId) };
};

export const destroySession = async (sessionId: string) => {
  const userId = await redis.get<string>(keys.session(sessionId));
  const tx = redis
    .multi()
    .del(keys.session(sessionId), keys.refreshHash(sessionId));
  if (userId) tx.srem(keys.userSessions(userId), sessionId);
  await tx.exec();
};

export const destroyAllSessions = async (userId: string) => {
  const sessionIds = await redis.smembers(keys.userSessions(userId));
  const tx = redis.multi().del(keys.userSessions(userId));
  for (const sid of sessionIds)
    tx.del(keys.session(sid), keys.refreshHash(sid));
  await tx.exec();
};
