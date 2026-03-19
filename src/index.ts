import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadEnv } from "./config/env.ts";
import pkg from "./package.json" with { type: "json" };
import { createServer } from "./server.ts";
import { log } from "./utils/logger.ts";

// ── CLI flags ──────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(pkg.version);
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
  log.info(`mcp-redtrack v${pkg.version} running on stdio`);

  // Non-blocking update check
  checkForUpdates().catch(() => {});
}

async function checkForUpdates() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(
      "https://api.github.com/repos/pijus/mcp-redtrack/releases/latest",
      { signal: controller.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return;
    const data = (await res.json()) as { tag_name?: string };
    const latest = data.tag_name?.replace(/^v/, "");
    if (latest && latest !== pkg.version) {
      log.info(`Update available: v${latest} (current: v${pkg.version})`);
    }
  } catch {
    clearTimeout(timer);
  }
}

main().catch((err) => {
  log.error("Fatal:", err);
  process.exit(1);
});
