import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatTable, unwrapResponse } from "../services/format.ts";
import {
  getCampaignById,
  getCampaigns,
  getCampaignsV2,
} from "../services/redtrack-api.ts";

export function registerCampaignTools(server: McpServer): void {
  server.tool(
    "get_campaigns",
    "List RedTrack campaigns with optional filtering by title, status, source, tags, and date range. Returns campaign config and optionally embedded stats when total_stat is true.",
    {
      title: z.string().optional().describe("Filter by campaign title (substring match)"),
      ids: z.string().optional().describe("Filter by campaign IDs (comma-separated)"),
      sources: z.string().optional().describe("Filter by source IDs (comma-separated)"),
      status: z
        .string()
        .optional()
        .describe("Filter by status (comma-separated). 1=active, 2=paused, 3=deleted"),
      tags: z.string().optional().describe("Filter by tags (comma-separated)"),
      date_from: z.string().optional().describe("Stats date from (YYYY-MM-DD)"),
      date_to: z.string().optional().describe("Stats date to (YYYY-MM-DD)"),
      timezone: z.string().optional().describe("Timezone for stats"),
      total_stat: z
        .boolean()
        .optional()
        .describe("Include total statistics (changes response to {total, items})"),
      page: z.number().optional().describe("Page number"),
      per: z.number().optional().describe("Items per page"),
    },
    async (args) => {
      const data = await getCampaigns(args);
      const { items, total } = unwrapResponse(data);
      const totalStr = total !== undefined ? ` of ${total} total` : "";
      const text = formatTable(items, `Campaigns (${items.length}${totalStr})`);
      return { content: [{ type: "text", text }] };
    },
  );

  server.tool(
    "get_campaign",
    "Get a single RedTrack campaign by ID with full configuration details including streams, postbacks, and integrations.",
    {
      id: z.string().describe("Campaign ID"),
    },
    async ({ id }) => {
      const data = await getCampaignById(id);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.tool(
    "get_campaigns_v2",
    "List RedTrack campaigns using the v2 endpoint. Similar to get_campaigns but with updated response format.",
    {
      title: z.string().optional().describe("Filter by campaign title"),
      ids: z.string().optional().describe("Filter by campaign IDs (comma-separated)"),
      sources: z.string().optional().describe("Filter by source IDs (comma-separated)"),
      status: z
        .string()
        .optional()
        .describe("Filter by status. 1=active, 2=paused, 3=deleted"),
      tags: z.string().optional().describe("Filter by tags (comma-separated)"),
      date_from: z.string().optional().describe("Stats date from (YYYY-MM-DD)"),
      date_to: z.string().optional().describe("Stats date to (YYYY-MM-DD)"),
      timezone: z.string().optional().describe("Timezone"),
      page: z.number().optional().describe("Page number"),
      per: z.number().optional().describe("Items per page"),
    },
    async (args) => {
      const data = await getCampaignsV2(args);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
