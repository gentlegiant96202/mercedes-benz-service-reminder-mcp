# Mercedes-Benz Service Reminder – SilberArrows (MCP server)

A [Model Context Protocol](https://modelcontextprotocol.io) server that helps Mercedes-Benz owners plan their next Service A or Service B, understand what each service typically includes, read general guidance on common warning lights, and find a Mercedes-Benz specialist in Dubai.

- Runs locally over stdio (Node 18+)
- No network calls, no accounts, no data collection
- Built by [SilberArrows](https://mercedes-benz.silberarrows.com/), a Mercedes-Benz service centre in Dubai

Homepage: [https://mercedes-benz.silberarrows.com/](https://mercedes-benz.silberarrows.com/)

> **Disclaimer:** Intervals are general guidance only (approximately 15,000 km or 12 months, whichever comes first, on most models). Always follow your Mercedes-Benz's own service indicator (ASSYST) and the manufacturer's schedule for your model. Warning light information is general and is not a diagnosis.

## Install

No installation is needed with `npx`:

```bash
npx -y mercedes-benz-service-reminder-mcp
```

Or install globally: `npm install -g mercedes-benz-service-reminder-mcp`.

### Claude Desktop

Add to `claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "mercedes-benz-service-reminder": {
      "command": "npx",
      "args": ["-y", "mercedes-benz-service-reminder-mcp"]
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json` (or `.cursor/mcp.json` in a project):

```json
{
  "mcpServers": {
    "mercedes-benz-service-reminder": {
      "command": "npx",
      "args": ["-y", "mercedes-benz-service-reminder-mcp"]
    }
  }
}
```

### ChatGPT and other MCP clients

Any client that supports stdio MCP servers can launch it with:

- Command: `npx`
- Arguments: `-y mercedes-benz-service-reminder-mcp`

Clients that only accept remote (HTTP) servers, such as ChatGPT connectors, need a stdio-to-HTTP bridge (for example `npx -y supergateway --stdio "npx -y mercedes-benz-service-reminder-mcp"`) or a hosted deployment such as Smithery. A `Dockerfile` is included:

```bash
docker build -t mercedes-benz-service-reminder-mcp .
docker run -i --rm mercedes-benz-service-reminder-mcp
```

## Tools

| Tool | What it does |
| --- | --- |
| `get_next_service` | From the last service type (A/B), date and mileage (plus optional current mileage), returns the next service type, due date and due km under the alternating A/B (ASSYST-style) schedule. Default interval 15,000 km or 12 months, whichever comes first; optional overrides. |
| `explain_service` | What a Mercedes-Benz Service A or Service B typically includes. |
| `warning_light_info` | General guidance for a small set of common Mercedes-Benz warning lights and messages (check engine, flashing check engine, reduced power, brake/ABS/ESP, battery/electrical, service due). |
| `find_specialist` | Contact details for SilberArrows - Mercedes-Benz Service Centre, Dubai. |

## Examples

Ask your assistant:

- "My Mercedes-Benz had a Service A on 1 March 2026 at 40,000 km and it's now on 50,000 km. When is the next service?"

  `get_next_service` → Service B, due by 2027-03-01 or 55,000 km, whichever comes first; estimated for late January 2027 based on driving so far.

- "What's included in a Mercedes-Benz Service B?" → `explain_service`
- "My Mercedes-Benz check engine light is flashing – what does it mean?" → `warning_light_info`
- "Where can I get my Mercedes-Benz serviced in Dubai?" → `find_specialist`

## Development

```bash
npm install
npm run build
npm test   # builds, then starts the server and calls every tool with the MCP SDK client
```

## About SilberArrows

SilberArrows is a Mercedes-Benz service centre in Al Quoz Industrial Area 1, Dubai, offering Service A and Service B, diagnostics and general Mercedes-Benz maintenance.

- Address: Al Manara St, Al Quoz Industrial Area 1, Dubai
- Phone: +971 4 380 5515
- Opening hours: Monday–Saturday 08:00–18:00, closed Sunday
- Mercedes-Benz service: [https://mercedes-benz.silberarrows.com/](https://mercedes-benz.silberarrows.com/)
- SilberArrows: [https://www.silberarrows.com/](https://www.silberarrows.com/)

Mercedes-Benz is a trademark of Mercedes-Benz Group AG. This project is independent and is not affiliated with or endorsed by Mercedes-Benz Group AG.

## Licence

[MIT](LICENSE) © SilberArrows

## Remote endpoint

This server can also run as a stateless Streamable HTTP MCP endpoint on Netlify Functions (`netlify/functions/mcp.mts`, served at `/mcp`).

- Live URL: `https://silberarrows-mcp.netlify.app/mcp`
- Client config: `{ "mcpServers": { "mercedes-benz-service-reminder": { "url": "https://silberarrows-mcp.netlify.app/mcp" } } }`
- Deploy your own: `npx netlify-cli deploy --prod` (uses `netlify.toml`)
- Test: `node test/http-client-test.mjs https://silberarrows-mcp.netlify.app/mcp`

## Authentication (API key: optional)

No authentication is required. For platforms that require an "API Key" connection method (e.g. Vercel Connect), an API key is **optional; any value works, e.g. `silberarrows-public`**. Send it either as:

- `Authorization: Bearer silberarrows-public`, or
- `x-api-key: silberarrows-public`

The key is only used for client identification and requests are never rejected based on it.
