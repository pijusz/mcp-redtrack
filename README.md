<p align="center">
  <img src="logo.svg" alt="mcp-redtrack" height="52">
</p>

<h1 align="center">mcp-redtrack</h1>

<p align="center">MCP server for the <a href="https://redtrack.io">RedTrack</a> affiliate tracking API. Query campaigns, clicks, conversions, and reports from any MCP-compatible client (Claude Code, Claude Desktop, Cursor, etc.).</p>

## Quick start

```bash
npx mcp-redtrack setup YOUR_API_KEY
```

This prints the config snippet for your MCP client.

### Claude Code

```bash
claude mcp add redtrack -e REDTRACK_API_KEY=YOUR_API_KEY -- npx mcp-redtrack
```

### Claude Desktop / Cursor

Add to your MCP settings JSON:

```json
{
  "mcpServers": {
    "redtrack": {
      "command": "npx",
      "args": ["mcp-redtrack"],
      "env": {
        "REDTRACK_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

## Tools (14)

### Campaigns
| Tool | Description |
|------|-------------|
| `get_campaigns` | List campaigns with filtering by title, status, source, tags, date range |
| `get_campaign` | Get single campaign by ID with full config |
| `get_campaigns_v2` | List campaigns via v2 endpoint |

### Logs
| Tool | Description |
|------|-------------|
| `get_clicks` | Click-level log with IP, country, device, campaign details (max 10k/page) |
| `get_conversions` | Conversion log with payout, cost, revenue, attribution (max 10k/page) |

### Reports
| Tool | Description |
|------|-------------|
| `get_report` | Aggregated stats grouped by dimension (campaign, offer, country, date, sub1-20, etc.) |

### Entities
| Tool | Description |
|------|-------------|
| `get_offers` | List offers with filtering |
| `get_offer` | Single offer by ID |
| `get_sources` | List traffic sources |
| `get_source` | Single source by ID |
| `get_networks` | List affiliate networks |
| `get_landings` | List landing pages |
| `get_settings` | Account settings (timezone, currency, conversion types) |

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDTRACK_API_KEY` | Yes | — | Your RedTrack API key |
| `REDTRACK_ENV_FILE` | No | `.env` | Path to .env file |

## Development

```bash
bun install          # install deps
bun run dev          # run MCP server
bun test             # run tests
bun run lint         # check formatting & lint
bun run inspect      # open MCP inspector
bun run build        # compile standalone binary
bun run build:npm    # bundle for Node.js / npm
```

## License

MIT
