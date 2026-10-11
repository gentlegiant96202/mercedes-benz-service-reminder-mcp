import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
const url = process.argv[2] || "http://localhost:8888/mcp";
const client = new Client({ name: "http-test", version: "1.0.0" });
await client.connect(new StreamableHTTPClientTransport(new URL(url)));
const { tools } = await client.listTools();
console.log("URL:", url, "\nTOOLS:", tools.map((t) => t.name).join(", "));
const calls = [
  ["get_next_service", { last_service_type: "A", last_service_date: "2026-03-01", last_service_km: 40000, current_km: 50000 }],
  ["explain_service", { service: "B" }],
  ["warning_light_info", { light: "flashing check engine" }],
  ["find_specialist", {}],
];
let fail = 0;
for (const [name, args] of calls) {
  const r = await client.callTool({ name, arguments: args });
  if (r.isError) fail++;
  console.log(`=== ${name} isError=${!!r.isError}: ${r.content[0].text.slice(0, 160).replace(/\s+/g, " ")}`);
}
await client.close();
if (fail) { console.error(`${fail} failures`); process.exit(1); }
console.log("ALL OK");
