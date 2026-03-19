# mcp-redtrack

MCP server for the RedTrack affiliate tracking API.

## Quick reference

| Item | Value |
|------|-------|
| Runtime | Bun (dev) / Node 18+ (npm) |
| Entry | `src/index.ts` |
| Build | `bun run build` (binary) or `bun run build:npm` (Node) |
| Test | `bun test` |
| Lint | `biome check .` |
| API base | `https://api.redtrack.io` |
| Auth | `api_key` query parameter on every request |
| Swagger | `swagger.json` (local copy) |

## Key patterns

- **MCP response format**: always `{ content: [{ type: "text", text: string }] }`
- **fetchWithRetry**: exponential backoff on 429/5xx, 30s timeout, 2 retries
- **Date defaults**: log tools default to last 7 days if no date range provided
- **Config**: Zod-validated env, lazy singleton, .env file support
- **Logging**: all logs to stderr via `log.info/warn/error/debug`

## Tools (14 total)

### Campaigns (3)
- `get_campaigns` — list with filters and optional stats
- `get_campaign` — single campaign by ID
- `get_campaigns_v2` — v2 endpoint

### Logs (2)
- `get_clicks` — click-level log (GET /tracks)
- `get_conversions` — conversion-level log

### Reports (1)
- `get_report` — aggregated stats grouped by dimension

### Entities (7)
- `get_offers` / `get_offer` — offer management
- `get_sources` / `get_source` — traffic sources
- `get_networks` — affiliate networks
- `get_landings` — landing pages
- `get_settings` — account settings

## Adding new tools

1. Create `src/tools/newmodule.ts` with `registerXTools(server)` export
2. Add Zod schemas for all parameters
3. Call API via `services/redtrack-api.ts`
4. Format output with `formatTable()` or JSON
5. Register in `src/tools/index.ts`
