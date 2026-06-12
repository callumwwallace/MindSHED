import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify from "fastify";
import { appRouter } from "./router";
import type { Context } from "./trpc";

const server = Fastify({ logger: true });

await server.register(cors, { origin: true });

server.get("/health", async () => ({ ok: true }));

await server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext: async (): Promise<Context> => ({}),
  },
});

const port = Number(process.env.PORT ?? 3000);
await server.listen({ port, host: "0.0.0.0" });

export type { AppRouter } from "./router";
