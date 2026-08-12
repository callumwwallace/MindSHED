import { seedPilotCodeFromEnvironment } from "./seed-pilot-code";

void seedPilotCodeFromEnvironment().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Pilot code seeding failed"}\n`);
  process.exitCode = 1;
});
