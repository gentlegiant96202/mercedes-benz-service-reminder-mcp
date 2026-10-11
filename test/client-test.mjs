import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const client = new Client({ name: "test", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: "node", args: ["dist/index.js"] }));
const { tools } = await client.listTools();
console.log("TOOLS:", tools.map((t) => t.name).join(", "));
const calls = [
  ["get_next_service", { last_service_type: "A", last_service_date: "2026-03-01", last_service_km: 40000, current_km: 50000 }],
  ["get_next_service", { last_service_type: "B", last_service_date: "2025-01-15", last_service_km: 60000 }],
  ["get_next_service", { last_service_type: "A", last_service_date: "2030-01-01", last_service_km: 1 }],
  ["explain_service", { service: "A" }],
  ["explain_service", { service: "B" }],
  ["warning_light_info", { light: "flashing check engine" }],
  ["warning_light_info", {}],
  ["find_specialist", {}],
];
let fail = 0;
for (const [name, args] of calls) {
  const r = await client.callTool({ name, arguments: args });
  console.log(`\n=== ${name} ${JSON.stringify(args)} isError=${!!r.isError}\n${r.content[0].text.slice(0, 700)}`);
}
await client.close();
