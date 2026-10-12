import { env } from "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";

async function startServer() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`server is running on port: ${env.port}`);
  });
}

startServer();
