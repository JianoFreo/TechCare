import app from "./app.js";
import { connectNeon, syncSchema } from "./config/db.js";
import { ENV } from "./config/env.js";
// import { initializeWebSocket } from "./websocket.js";
import { closeAllQueueStreams } from "./services/queueStream.js";

// IMPORTANT: Render needs process.env.PORT

async function initializeServer() {
  try {
    await connectNeon();

    if (ENV.IS_PRODUCTION) {
      console.log(
        "IS_PRODUCTION:",
        ENV.IS_PRODUCTION,
        typeof ENV.IS_PRODUCTION,
      );
      await syncSchema(); // only turn this on if you want the schema to sync the database // don't turn this on while editing the db
    }

    const server = app.listen(ENV.PORT, () => {
      console.log(`Server is up and running on http://localhost:${ENV.PORT}`);
    });
    // initializeWebSocket(server);

    // Deploys send SIGTERM. Close SSE streams first, otherwise server.close()
    // waits forever on connections that never end on their own.
    const shutdown = (signal: string) => {
      console.log(`${signal} received, closing queue streams...`);
      closeAllQueueStreams();
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10_000).unref();
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Error initializing server:", error);
    process.exit(1);
  }
}

await initializeServer();