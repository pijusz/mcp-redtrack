import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "./tools/index.ts";
import { VERSION } from "./version.ts";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-redtrack",
    version: VERSION,
  });
  registerAllTools(server);
  return server;
}
