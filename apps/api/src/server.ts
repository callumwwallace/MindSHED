import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify from "fastify";
import { pilotRuntimeConfig } from "./config";
import { assertDatabaseReady } from "./db";
import { appRouter } from "./router";
import type { Context } from "./trpc";

export async function buildServer({ logger = true }: { logger?: boolean } = {}) {
  const runtime = pilotRuntimeConfig();
  const server = Fastify({
    bodyLimit: 128 * 1024,
    disableRequestLogging: true,
    trustProxy: runtime.trustProxy,
    logger: logger
      ? {
          redact: {
            paths: ["req.headers.authorization", "req.headers.cookie", "body", "params", "query"],
            censor: "[redacted]",
          },
        }
      : false,
  });

  await server.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  await server.register(rateLimit, {
    global: true,
    max: runtime.rateLimitMax,
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
  server.get("/ready", async (_request, reply) => {
    try {
      await assertDatabaseReady();
      return { ok: true };
    } catch {
      return reply.code(503).send({ ok: false, error: "service-not-ready" });
    }
  });

  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext: async (): Promise<Context> => ({}),
    },
  });
  return server;
}
