import { afterEach, beforeEach, describe, expect, test } from "bun:test";

describe("env", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    // Reset module cache so loadEnv re-runs
    delete require.cache[require.resolve("../src/config/env.ts")];
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  test("throws when REDTRACK_API_KEY is missing", async () => {
    delete process.env.REDTRACK_API_KEY;
    // Point to non-existent env file so dotenv can't fill in the key
    process.env.REDTRACK_ENV_FILE = "/tmp/.env.nonexistent";
    const { loadEnv } = await import("../src/config/env.ts");
    expect(() => loadEnv()).toThrow("REDTRACK_API_KEY");
  });

  test("succeeds with valid API key", async () => {
    process.env.REDTRACK_API_KEY = "test-key-123";
    const { loadEnv } = await import("../src/config/env.ts");
    const env = loadEnv();
    expect(env.REDTRACK_API_KEY).toBe("test-key-123");
  });

  test("defaults REDTRACK_ENV_FILE to .env", async () => {
    process.env.REDTRACK_API_KEY = "test-key";
    const { loadEnv } = await import("../src/config/env.ts");
    const env = loadEnv();
    expect(env.REDTRACK_ENV_FILE).toBe(".env");
  });
});
