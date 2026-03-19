# Agent Guidelines — mcp-redtrack

## Project structure

```
src/
├── index.ts              # Entry point (stdio transport)
├── server.ts             # McpServer creation + tool registration
├── config/
│   └── env.ts            # Zod-validated environment config
├── services/
│   ├── redtrack-api.ts   # REST client with retry logic
│   └── format.ts         # Table/CSV/date formatters
├── tools/
│   ├── index.ts          # registerAllTools barrel
│   ├── campaigns.ts      # Campaign tools (3)
│   ├── logs.ts           # Click & conversion log tools (2)
│   ├── reports.ts        # Aggregated report tool (1)
│   └── entities.ts       # Offers, sources, networks, landings, settings (7)
└── utils/
    └── logger.ts         # stderr logger
```

## Authentication

All RedTrack API calls use `api_key` as a query parameter. The key is read from
`REDTRACK_API_KEY` env var or `.env` file. No OAuth or token refresh needed.

## API conventions

- Base URL: `https://api.redtrack.io`
- All GET endpoints accept query parameters
- Pagination: `page` + `per` params
- Date filtering: `date_from` + `date_to` (YYYY-MM-DD)
- Status values: 1=active, 2=paused, 3=deleted
- Comma-separated IDs for multi-filter (e.g. `ids=1,2,3`)

## Report grouping dimensions

campaign, offer, source, landing, network, country, region, city,
os, browser, device, device_brand, connection_type, isp,
date, hour, day_of_week, sub1-sub20,
rt_source, rt_medium, rt_campaign, rt_adgroup, rt_ad, rt_placement, rt_keyword

## Tool registration pattern

```typescript
export function registerXTools(server: McpServer): void {
  server.tool("tool_name", "description", { ...zodSchema }, async (args) => {
    const data = await apiCall(args);
    return { content: [{ type: "text", text: formatResult(data) }] };
  });
}
```

## Best practices

- Always return `{ content: [{ type: "text", text }] }`
- Default date ranges to last 7 days for log queries
- Use `formatTable()` for list responses, `JSON.stringify` for single items
- Log to stderr only (stdout is MCP protocol)
- Handle API errors by throwing (MCP SDK surfaces them to the client)
