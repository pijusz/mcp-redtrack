import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCampaignTools } from "./campaigns.ts";
import { registerEntityTools } from "./entities.ts";
import { registerLogTools } from "./logs.ts";
import { registerReportTools } from "./reports.ts";

export function registerAllTools(server: McpServer): void {
  registerCampaignTools(server);
  registerLogTools(server);
  registerReportTools(server);
  registerEntityTools(server);
}
