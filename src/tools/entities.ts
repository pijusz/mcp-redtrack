import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatTable, unwrapResponse } from "../services/format.ts";
import {
  DICTIONARIES,
  getDictionary,
  getDomains,
  getLandingById,
  getLandings,
  getNetworkById,
  getNetworks,
  getOfferById,
  getOffers,
  getSettings,
  getSourceById,
  getSources,
  getStreams,
} from "../services/redtrack-api.ts";
import { readTool } from "../utils/register-tool.ts";

type TextResult = { content: { type: "text"; text: string }[] };

function tableResult(label: string, data: unknown): TextResult {
  const { items, total } = unwrapResponse(data);
  const totalStr = total !== undefined ? ` of ${total} total` : "";
  const text = formatTable(items, `${label} (${items.length}${totalStr})`);
  return { content: [{ type: "text", text }] };
}

function jsonResult(data: unknown): TextResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

const listFilters = {
  title: z.string().optional().describe("Filter by title (substring match)"),
  ids: z.string().optional().describe("Filter by IDs (comma-separated)"),
  date_from: z
    .string()
    .optional()
    .describe("Stats date from (YYYY-MM-DD), used with total_stat"),
  date_to: z
    .string()
    .optional()
    .describe("Stats date to (YYYY-MM-DD), used with total_stat"),
  total_stat: z
    .boolean()
    .optional()
    .describe("Include total statistics (changes response to {total, items})"),
  page: z.number().int().positive().optional().describe("Page number (1-based)"),
  per: z.number().int().positive().optional().describe("Items per page"),
};

const idParam = (what: string) => ({
  id: z.string().min(1).describe(`${what} ID`),
});

export function registerEntityTools(server: McpServer): void {
  readTool(
    server,
    "get_offers",
    "List RedTrack offers with optional filtering by title, IDs, affiliate network, country, status, or tags.",
    {
      ...listFilters,
      networks: z
        .string()
        .optional()
        .describe("Filter by affiliate network IDs (comma-separated)"),
      countries: z
        .string()
        .optional()
        .describe("Filter by country codes (comma-separated, e.g. US,DE)"),
      status: z
        .string()
        .optional()
        .describe("Filter by status (comma-separated). 1=active, 2=paused, 3=deleted"),
      tags: z.string().optional().describe("Filter by tags (comma-separated)"),
    },
    async (args) => tableResult("Offers", await getOffers(args)),
  );

  readTool(
    server,
    "get_offer",
    "Get a single RedTrack offer by ID with full details (URL, payout, network, caps).",
    idParam("Offer"),
    async ({ id }) => jsonResult(await getOfferById(id)),
  );

  readTool(
    server,
    "get_sources",
    "List RedTrack traffic sources configured in the account, optionally filtered by title or IDs.",
    listFilters,
    async (args) => tableResult("Sources", await getSources(args)),
  );

  readTool(
    server,
    "get_source",
    "Get a single RedTrack traffic source by ID, including its parameters and postback settings.",
    idParam("Source"),
    async ({ id }) => jsonResult(await getSourceById(id)),
  );

  readTool(
    server,
    "get_networks",
    "List RedTrack affiliate networks (offer sources), optionally filtered by title or IDs.",
    listFilters,
    async (args) => tableResult("Networks", await getNetworks(args)),
  );

  readTool(
    server,
    "get_network",
    "Get a single RedTrack affiliate network (offer source) by ID, including postback settings.",
    idParam("Network"),
    async ({ id }) => jsonResult(await getNetworkById(id)),
  );

  readTool(
    server,
    "get_landings",
    "List RedTrack landing pages and prelandings, optionally filtered by title, IDs, type, or tags.",
    {
      ...listFilters,
      type: z
        .string()
        .optional()
        .describe("Filter by landing type (landing or prelanding)"),
      tags: z.string().optional().describe("Filter by tags (comma-separated)"),
    },
    async (args) => tableResult("Landings", await getLandings(args)),
  );

  readTool(
    server,
    "get_landing",
    "Get a single RedTrack landing page or prelanding by ID.",
    idParam("Landing"),
    async ({ id }) => jsonResult(await getLandingById(id)),
  );

  readTool(
    server,
    "get_streams",
    "List RedTrack streams (campaign traffic flows with their offers, landings, and rules).",
    {
      title: z.string().optional().describe("Filter by stream title"),
      page: z.number().int().positive().optional().describe("Page number (1-based)"),
      per: z.number().int().positive().optional().describe("Items per page"),
    },
    async (args) => jsonResult(await getStreams(args)),
  );

  readTool(
    server,
    "get_domains",
    "List tracking domains configured in the RedTrack account.",
    {
      type: z.string().optional().describe("Filter by domain type"),
      page: z.number().int().positive().optional().describe("Page number (1-based)"),
      per: z.number().int().positive().optional().describe("Items per page"),
    },
    async (args) => tableResult("Domains", await getDomains(args)),
  );

  readTool(
    server,
    "get_dictionary",
    "Get a RedTrack reference list (e.g. countries, currencies, timezones, browsers, OS, devices, ISPs). Useful for finding valid filter values.",
    {
      name: z.enum(DICTIONARIES).describe("Which reference list to fetch"),
    },
    async ({ name }) => {
      const data = await getDictionary(name);
      if (Array.isArray(data) && data.every((v) => typeof v !== "object")) {
        return {
          content: [
            { type: "text", text: `${name} (${data.length})\n\n${data.join("\n")}` },
          ],
        };
      }
      return tableResult(name, data);
    },
  );

  readTool(
    server,
    "get_settings",
    "Get RedTrack account settings including timezone, currency, and conversion types.",
    {},
    async () => jsonResult(await getSettings()),
  );
}
