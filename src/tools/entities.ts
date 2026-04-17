import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatTable } from "../services/format.ts";
import {
  getLandings,
  getNetworks,
  getOfferById,
  getOffers,
  getSettings,
  getSourceById,
  getSources,
} from "../services/redtrack-api.ts";
import { readTool } from "../utils/register-tool.ts";

export function registerEntityTools(server: McpServer): void {
  readTool(
    server,
    "get_offers",
    "List RedTrack offers with optional filtering by title, network, or status.",
    {
      title: z.string().optional().describe("Filter by offer title"),
      ids: z.string().optional().describe("Filter by offer IDs (comma-separated)"),
      network_id: z.string().optional().describe("Filter by network ID"),
      status: z
        .string()
        .optional()
        .describe("Filter by status. 1=active, 2=paused, 3=deleted"),
      page: z.number().optional().describe("Page number"),
      per: z.number().optional().describe("Items per page"),
    },
    async (args) => {
      const data = await getOffers(args);
      const items = Array.isArray(data) ? data : [data];
      const text = formatTable(
        items as Record<string, unknown>[],
        `Offers (${items.length})`,
      );
      return { content: [{ type: "text", text }] };
    },
  );

  readTool(
    server,
    "get_offer",
    "Get a single RedTrack offer by ID with full details.",
    {
      id: z.string().describe("Offer ID"),
    },
    async ({ id }) => {
      const data = await getOfferById(id);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  readTool(
    server,
    "get_sources",
    "List all RedTrack traffic sources configured in the account.",
    {},
    async () => {
      const data = await getSources();
      const items = Array.isArray(data) ? data : [data];
      const text = formatTable(
        items as Record<string, unknown>[],
        `Sources (${items.length})`,
      );
      return { content: [{ type: "text", text }] };
    },
  );

  readTool(
    server,
    "get_source",
    "Get a single RedTrack traffic source by ID.",
    {
      id: z.string().describe("Source ID"),
    },
    async ({ id }) => {
      const data = await getSourceById(id);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  readTool(
    server,
    "get_networks",
    "List all RedTrack affiliate networks (offer sources).",
    {},
    async () => {
      const data = await getNetworks();
      const items = Array.isArray(data) ? data : [data];
      const text = formatTable(
        items as Record<string, unknown>[],
        `Networks (${items.length})`,
      );
      return { content: [{ type: "text", text }] };
    },
  );

  readTool(
    server,
    "get_landings",
    "List all RedTrack landing pages and prelandings.",
    {},
    async () => {
      const data = await getLandings();
      const items = Array.isArray(data) ? data : [data];
      const text = formatTable(
        items as Record<string, unknown>[],
        `Landings (${items.length})`,
      );
      return { content: [{ type: "text", text }] };
    },
  );

  readTool(
    server,
    "get_settings",
    "Get RedTrack account settings including timezone, currency, and conversion types.",
    {},
    async () => {
      const data = await getSettings();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
