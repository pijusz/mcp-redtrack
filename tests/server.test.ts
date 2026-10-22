import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import pkg from "../package.json" with { type: "json" };
import { createServer } from "../src/server.ts";

describe("server", () => {
  test("reports package version and registers read-only tools", async () => {
    const server = createServer();
    const [clientT, serverT] = InMemoryTransport.createLinkedPair();
    await server.connect(serverT);
    const client = new Client({ name: "test", version: "0" });
    await client.connect(clientT);

    expect(client.getServerVersion()?.version).toBe(pkg.version);
    const { tools } = await client.listTools();
    expect(tools.length).toBe(18);
    for (const t of tools) {
      expect(t.annotations?.readOnlyHint).toBe(true);
      expect(t.description?.length ?? 0).toBeGreaterThan(10);
    }
    await client.close();
  });
});
