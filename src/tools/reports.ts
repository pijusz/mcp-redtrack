import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  dateRange,
  formatTable,
  stripEmptyColumns,
  unwrapResponse,
} from "../services/format.ts";
import { getReport } from "../services/redtrack-api.ts";

export function registerReportTools(server: McpServer): void {
  server.tool(
    "get_report",
    "Get RedTrack aggregated report grouped by a dimension (e.g. campaign, offer, source, country, sub1-sub20, date, hour). Includes metrics like impressions, clicks, conversions, cost, revenue, profit, ROI, CR, EPC, CPC.",
    {
      group: z
        .string()
        .describe(
          "Grouping dimension: campaign, offer, source, landing, network, country, region, city, os, browser, device, device_brand, connection_type, isp, date, hour, day_of_week, sub1-sub20, rt_source, rt_medium, rt_campaign, rt_adgroup, rt_ad, rt_placement, rt_keyword",
        ),
      date_from: z
        .string()
        .optional()
        .describe("Start date (YYYY-MM-DD). Defaults to 7 days ago."),
      date_to: z
        .string()
        .optional()
        .describe("End date (YYYY-MM-DD). Defaults to today."),
      tracks_view: z
        .string()
        .optional()
        .describe("Use cached costs for faster report generation"),
      timezone: z.string().optional().describe("Custom timezone"),
      time_interval: z.string().optional().describe("Custom time interval"),
      campaign_id: z
        .string()
        .optional()
        .describe("Filter by campaign IDs (comma-separated)"),
      source_id: z.string().optional().describe("Filter by source IDs (comma-separated)"),
      offer_id: z.string().optional().describe("Filter by offer IDs (comma-separated)"),
      landing_id: z
        .string()
        .optional()
        .describe("Filter by landing IDs (comma-separated)"),
      network_id: z
        .string()
        .optional()
        .describe("Filter by network IDs (comma-separated)"),
      sub1: z.string().optional().describe("Filter by sub1"),
      sub2: z.string().optional().describe("Filter by sub2"),
      sub3: z.string().optional().describe("Filter by sub3"),
      sub4: z.string().optional().describe("Filter by sub4"),
      sub5: z.string().optional().describe("Filter by sub5"),
      page: z.number().optional().describe("Page number"),
      per: z.number().optional().describe("Items per page (max 1000)"),
    },
    async (args) => {
      const defaults = dateRange(7);
      const params = {
        group: args.group,
        date_from: args.date_from ?? defaults.date_from,
        date_to: args.date_to ?? defaults.date_to,
        ...(args.tracks_view && { tracks_view: args.tracks_view }),
        ...(args.timezone && { timezone: args.timezone }),
        ...(args.time_interval && { time_interval: args.time_interval }),
        ...(args.campaign_id && { campaign_id: args.campaign_id }),
        ...(args.source_id && { source_id: args.source_id }),
        ...(args.offer_id && { offer_id: args.offer_id }),
        ...(args.landing_id && { landing_id: args.landing_id }),
        ...(args.network_id && { network_id: args.network_id }),
        ...(args.sub1 && { sub1: args.sub1 }),
        ...(args.sub2 && { sub2: args.sub2 }),
        ...(args.sub3 && { sub3: args.sub3 }),
        ...(args.sub4 && { sub4: args.sub4 }),
        ...(args.sub5 && { sub5: args.sub5 }),
        ...(args.page !== undefined && { page: args.page }),
        ...(args.per !== undefined && { per: args.per }),
      };
      const data = await getReport(params);
      const { items } = unwrapResponse(data);
      const cleaned = stripEmptyColumns(items);
      const text = formatTable(
        cleaned,
        `Report by ${args.group} (${items.length}) — ${params.date_from} to ${params.date_to}`,
      );
      return { content: [{ type: "text", text }] };
    },
  );
}
