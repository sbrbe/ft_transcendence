import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import dotenv from "dotenv";
import Fastify from "fastify";
import { closeDatabase, initDatabase } from "./database/init.js";
import { activityRoutes } from "./routes/activity.js";
import { gameRoutes } from "./routes/gameRoutes.js";
import { tournamentRoutes } from "./routes/tournamentRoutes.js";
import { websocketRoutes } from "./routes/websocketRoutes.js";
import fs from "fs";

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.COOKIE_SECRET) {
  throw new Error("JWT_SECRET or COOKIE_SECRET is not set");
}

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === "development" ? "info" : "warn",
  },
  https: {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  }
});

fastify.register(import("@fastify/cors"), {
  origin: "https://localhost:8443",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
});

if (process.env.NODE_ENV === "development") {
  fastify.register(swagger, {
    openapi: {
      info: {
        title: "Pong Game API",
        description: "Real-time Pong game microservice API documentation",
        version: "1.0.0",
      },
      servers: [{ url: "https://localhost:4443" }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          Error: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
  });

  fastify.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
  });
}

fastify.register(import("@fastify/jwt"), {
  secret: process.env.JWT_SECRET,
});

fastify.register(import("@fastify/cookie"), {
  secret: process.env.COOKIE_SECRET,
});

fastify.register(import("@fastify/websocket"));

fastify.get("/", async (request, reply) => {
  return {
    message: "Pong Game Microservice is running",
    version: "1.0.0",
    endpoints: {
      docs: "/docs",
      health: "/health",
      games: "/game",
      websocket: "/wss/game/:gameId",
    },
  };
});

fastify.get("/health", async (request, reply) => {
  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "pong-game",
  };
});

async function start() {
  try {
    console.log("🎮 Initializing Pong Game Microservice...");

    initDatabase();
    console.log("✅ Database initialized successfully");

    await fastify.register(gameRoutes);
    console.log("✅ Game routes registered");

    await fastify.register(tournamentRoutes);
    console.log("✅ Tournament routes registered");

    await fastify.register(websocketRoutes);
    console.log("✅ WebSocket routes registered");

    await fastify.register(activityRoutes);
    console.log("✅ Activity routes registered");

    const port = Number(process.env.HTTPS_PORT) || 4443
    const host = process.env.HOST || "0.0.0.0";

    console.log(`🚀 Starting server on ${host}:${port}...`);

    await fastify.listen({ port, host });

    console.log(`✅ Pong Game Microservice started successfully!`);
    console.log(`🌐 Server: https://${host}:${port}`);

    if (process.env.NODE_ENV === "development") {
      console.log(`📚 API Documentation: http://${host}:${port}/docs`);
    }
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error(error);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  console.log("🛑 Shutting down gracefully...");

  try {
    await fastify.close();
    closeDatabase();
    console.log("✅ Server closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

start();
