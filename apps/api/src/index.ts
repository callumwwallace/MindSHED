import { closeDb } from "./db";
import { buildServer } from "./server";
import { assertProductionConfiguration } from "./config";

async function main() {
  assertProductionConfiguration();
  const server = await buildServer();
  const port = Number(process.env.PORT ?? 3000);
  await server.listen({ port, host: "0.0.0.0" });

  let closing = false;
  async function shutdown() {
    if (closing) return;
    closing = true;
    await server.close();
    await closeDb();
  }

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      void shutdown()
        .then(() => process.exit(0))
        .catch((error: unknown) => {
          server.log.error(error, "Graceful shutdown failed");
          process.exit(1);
        });
    });
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

export type { AppRouter } from "./router";
