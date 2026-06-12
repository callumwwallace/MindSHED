import { z } from "zod";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  health: router({
    ping: publicProcedure.query(() => ({
      ok: true,
      service: "mindshed-api",
      time: new Date(),
    })),
    echo: publicProcedure
      .input(z.object({ message: z.string() }))
      .query(({ input }) => ({ echo: input.message })),
  }),
});

export type AppRouter = typeof appRouter;
