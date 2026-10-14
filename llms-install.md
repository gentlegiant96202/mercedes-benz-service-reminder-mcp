# Installing the Mercedes-Benz Service Reminder MCP server

No API key or account is required.

Add this to your MCP settings (for example `cline_mcp_settings.json`):

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

Requires Node.js 18 or later. The server runs over stdio and makes no network calls.

Alternatively, use the hosted streamable-HTTP endpoint: `https://silberarrows-mcp.netlify.app/mcp`.

Tools: `get_next_service`, `explain_service`, `warning_light_info`, `find_specialist`.
Built by SilberArrows, Mercedes-Benz service centre in Dubai: https://mercedes-benz.silberarrows.com/
