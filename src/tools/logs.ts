import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { dateRange, formatTable, unwrapResponse } from "../services/format.ts";
import { getClicks, getConversions } from "../services/redtrack-api.ts";
import { readTool } from "../utils/register-tool.ts";

export function registerLogTools(server: McpServer): void {
  readTool(
    server,
    "get_clicks",
    "Get RedTrack click log entries. Returns click-level data including IP, country, device, campaign, offer, landing, and sub-parameter details. Max 10000 per page.",
    {
      date_from: z
        .string()
        .optional()
        .describe("Start date (YYYY-MM-DD). Defaults to 7 days ago."),
      date_to: z
        .string()
        .optional()
        .describe("End date (YYYY-MM-DD). Defaults to today."),
      clickid: z.string().optional().describe("Filter by click ID"),
      country_code: z
        .string()
        .optional()
        .describe("Filter by country code (e.g. US, DE)"),
      campaign_id: z.string().optional().describe("Filter by campaign ID"),
      source_id: z.string().optional().describe("Filter by source ID"),
      offer_id: z.string().optional().describe("Filter by offer ID"),
      network_id: z.string().optional().describe("Filter by network ID"),
      fingerprint: z.string().optional().describe("Filter by fingerprint"),
      page: z.number().optional().describe("Page number"),
      per: z.number().optional().describe("Items per page (max 10000)"),
    },
    async (args) => {
      const defaults = dateRange(7);
      const params = {
        date_from: args.date_from ?? defaults.date_from,
        date_to: args.date_to ?? defaults.date_to,
        ...(args.clickid && { clickid: args.clickid }),
        ...(args.country_code && { country_code: args.country_code }),
        ...(args.campaign_id && { campaign_id: args.campaign_id }),
        ...(args.source_id && { source_id: args.source_id }),
        ...(args.offer_id && { offer_id: args.offer_id }),
        ...(args.network_id && { network_id: args.network_id }),
        ...(args.fingerprint && { fingerprint: args.fingerprint }),
        ...(args.page !== undefined && { page: args.page }),
        ...(args.per !== undefined && { per: args.per }),
      };
      const data = await getClicks(params);
      const { items, total } = unwrapResponse(data);
      const totalStr = total !== undefined ? ` of ${total} total` : "";
      const text = formatTable(
        items,
        `Clicks (${items.length}${totalStr}) — ${params.date_from} to ${params.date_to}`,
      );
      return { content: [{ type: "text", text }] };
    },
  );

  readTool(
    server,
    "get_conversions",
    "Get RedTrack conversion log entries. Returns conversion-level data including click ID, payout, cost, revenue, country, device, attribution type, and all sub-parameters. Max 10000 per page.",
    {
      date_from: z
        .string()
        .optional()
        .describe("Start date (YYYY-MM-DD). Defaults to 7 days ago."),
      date_to: z
        .string()
        .optional()
        .describe("End date (YYYY-MM-DD). Defaults to today."),
      clickid: z.string().optional().describe("Filter by click ID"),
      country_code: z.string().optional().describe("Filter by country code"),
      type: z.string().optional().describe("Filter by conversion type"),
      type_role: z.string().optional().describe("Filter by type role"),
      campaign_id: z.string().optional().describe("Filter by campaign ID"),
      source_id: z.string().optional().describe("Filter by source ID"),
      offer_id: z.string().optional().describe("Filter by offer ID"),
      network_id: z.string().optional().describe("Filter by network ID"),
      fingerprint: z.string().optional().describe("Filter by fingerprint"),
      page: z.number().optional().describe("Page number"),
      per: z.number().optional().describe("Items per page (max 10000)"),
    },
    async (args) => {
      const defaults = dateRange(7);
      const params = {
        date_from: args.date_from ?? defaults.date_from,
        date_to: args.date_to ?? defaults.date_to,
        ...(args.clickid && { clickid: args.clickid }),
        ...(args.country_code && { country_code: args.country_code }),
        ...(args.type && { type: args.type }),
        ...(args.type_role && { type_role: args.type_role }),
        ...(args.campaign_id && { campaign_id: args.campaign_id }),
        ...(args.source_id && { source_id: args.source_id }),
        ...(args.offer_id && { offer_id: args.offer_id }),
        ...(args.network_id && { network_id: args.network_id }),
        ...(args.fingerprint && { fingerprint: args.fingerprint }),
        ...(args.page !== undefined && { page: args.page }),
        ...(args.per !== undefined && { per: args.per }),
      };
      const data = await getConversions(params);
      const { items, total } = unwrapResponse(data);
      const totalStr = total !== undefined ? ` of ${total} total` : "";
      const text = formatTable(
        items,
        `Conversions (${items.length}${totalStr}) — ${params.date_from} to ${params.date_to}`,
      );
      return { content: [{ type: "text", text }] };
    },
  );
}
