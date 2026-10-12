import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Database was connected successfully!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
