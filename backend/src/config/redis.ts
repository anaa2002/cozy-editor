import { Redis } from "@upstash/redis";
import { env } from "./env.js";

const redis = new Redis({
  url: env.redisUrl,
  token: env.redisToken,
  // Values are stored as plain strings; skip Upstash's JSON parsing.
  automaticDeserialization: false,
});

export default redis;
