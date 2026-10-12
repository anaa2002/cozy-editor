import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env variable: ${name}`);
  return value;
}

function positiveNumber(name: string): number {
  const value = Number(required(name));
  if (!Number.isFinite(value) || value <= 0)
    throw new Error(`Env variable ${name} must be a positive number`);
  return value;
}

function sameSite(): "lax" | "strict" | "none" {
  const value = (process.env.COOKIE_SAME_SITE ?? "lax").toLowerCase();
  if (value !== "lax" && value !== "strict" && value !== "none")
    throw new Error("COOKIE_SAME_SITE must be lax, strict or none");
  return value;
}

const isProd = process.env.NODE_ENV === "production";

export const env = {
  isProd,
  port: Number(process.env.PORT ?? 5001),
  clientUrl: required("CLIENT_URL"),
  mongoUri: required("MONGO_URI"),
  redisUrl: required("UPSTASH_REDIS_REST_URL"),
  redisToken: required("UPSTASH_REDIS_REST_TOKEN"),
  accessTokenSecret: required("ACCESS_TOKEN_SECRET"),
  accessTokenMinutes: positiveNumber("ACCESS_TOKEN_EXPIRES"),
  refreshTokenDays: positiveNumber("REFRESH_TOKEN_EXPIRES"),
  // Use "none" when client and API are on different sites (forces secure cookies).
  cookieSameSite: sameSite(),
} as const;
