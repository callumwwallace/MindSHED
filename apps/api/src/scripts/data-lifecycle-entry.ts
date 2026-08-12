import { runDataLifecycleFromEnvironmentAndClose } from "./run-data-lifecycle";

void runDataLifecycleFromEnvironmentAndClose().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Data lifecycle failed"}\n`);
  process.exitCode = 1;
});
