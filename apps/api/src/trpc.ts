import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Request-scoped values (auth session, db handle) get added here as features land.
export interface Context {}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
