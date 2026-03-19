import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import pkg from "./package.json" with { type: "json" };
import { registerAllTools } from "./tools/index.ts";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-redtrack",
    version: pkg.version,
  });
  registerAllTools(server);
  return server;
}
