import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify from "fastify";
import { appRouter } from "./router";
import type { Context } from "./trpc";

export async function buildServer({ logger = true }: { logger?: boolean } = {}) {
  const server = Fastify({
    bodyLimit: 128 * 1024,
    disableRequestLogging: true,
    logger: logger
      ? {
          redact: {
            paths: ["req.headers.authorization", "req.headers.cookie", "body", "params", "query"],
            censor: "[redacted]",
          },
        }
      : false,
  });

  await server.register(rateLimit, {
    global: true,
    max: 120,
    timeWindow: "1 minute",
    cache: 5_000,
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: "Please wait before trying again",
    }),
  });

  const allowedOrigins = process.env.CORS_ORIGIN
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  await server.register(cors, { origin: allowedOrigins?.length ? allowedOrigins : false });

  server.get("/health", async () => ({ ok: true }));

  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext: async (): Promise<Context> => ({}),
    },
  });
  return server;
}
