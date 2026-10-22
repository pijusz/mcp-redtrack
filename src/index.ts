import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadEnv } from "./config/env.ts";
import { createServer } from "./server.ts";
import { log } from "./utils/logger.ts";
import { VERSION } from "./version.ts";

// ── CLI flags ──────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(VERSION);
  process.exit(0);
}

if (args[0] === "setup") {
  const apiKey = args[1] || process.env.REDTRACK_API_KEY;
  if (!apiKey) {
    console.error("Usage: mcp-redtrack setup <API_KEY>");
    console.error("       npx mcp-redtrack setup <API_KEY>");
    process.exit(1);
  }
  console.log("Add this MCP server to your client:\n");
  console.log("Claude Code:");
  console.log(
    `  claude mcp add redtrack -- npx mcp-redtrack\n  (then set REDTRACK_API_KEY=${apiKey} in your env)\n`,
  );
  console.log("Claude Desktop / Cursor (settings JSON):");
  console.log(
    JSON.stringify(
      {
        mcpServers: {
          redtrack: {
            command: "npx",
            args: ["mcp-redtrack"],
            env: { REDTRACK_API_KEY: apiKey },
          },
        },
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

// ── Start server ───────────────────────────────────────────────────

async function main() {
  // Preflight: validate env
  try {
    loadEnv();
    log.info("Environment validated");
  } catch (err) {
    log.error("Environment validation failed:", err);
    log.error("Set REDTRACK_API_KEY or create a .env file");
  }

  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log.info(`mcp-redtrack v${VERSION} running on stdio`);

  // Non-blocking update check
  checkForUpdates().catch(() => {});
}

async function checkForUpdates() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(
      "https://api.github.com/repos/pijusz/mcp-redtrack/releases/latest",
      { signal: controller.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return;
    const data = (await res.json()) as { tag_name?: string };
    const latest = data.tag_name?.replace(/^v/, "");
    if (latest && isNewer(latest, VERSION)) {
      log.info(`Update available: v${latest} (current: v${VERSION})`);
    }
  } catch {
    clearTimeout(timer);
  }
}

function isNewer(a: string, b: string): boolean {
  const pa = a.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d > 0;
  }
  return false;
}

main().catch((err) => {
  log.error("Fatal:", err);
  process.exit(1);
});
