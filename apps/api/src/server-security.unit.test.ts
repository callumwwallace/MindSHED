import assert from "node:assert/strict";
import test from "node:test";

import { buildServer } from "./server";

test("the HTTP edge rate-limits repeated requests without reflecting sensitive data", async () => {
  const previous = process.env.RATE_LIMIT_MAX;
  process.env.RATE_LIMIT_MAX = "2";
  const server = await buildServer({ logger: false });
  try {
    assert.equal((await server.inject({ method: "GET", url: "/health" })).statusCode, 200);
    assert.equal((await server.inject({ method: "GET", url: "/health" })).statusCode, 200);
    const limited = await server.inject({ method: "GET", url: "/health" });
    assert.equal(limited.statusCode, 429);
    assert.deepEqual(limited.json(), {
      statusCode: 429,
      error: "Too Many Requests",
      message: "Please wait before trying again",
    });
  } finally {
    await server.close();
    if (previous === undefined) delete process.env.RATE_LIMIT_MAX;
    else process.env.RATE_LIMIT_MAX = previous;
  }
});
