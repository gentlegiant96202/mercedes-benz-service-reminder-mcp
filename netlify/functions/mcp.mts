import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServer } from "../../src/server.ts";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
};
const withCors = (res: Response) => { const h = new Headers(res.headers); for (const [k, v] of Object.entries(CORS)) h.set(k, v); return new Response(res.body, { status: res.status, headers: h }); };
const json = (obj: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(obj, null, 2), { status, headers: { "Content-Type": "application/json", ...CORS, ...extra } });

export default async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method === "GET") return json({ name: "Mercedes-Benz Service Reminder MCP – SilberArrows", transport: "streamable-http (stateless)", usage: "POST JSON-RPC MCP messages to this URL", repo: "https://github.com/gentlegiant96202/mercedes-benz-service-reminder-mcp" }, 405, { Allow: "POST, OPTIONS" });
  if (req.method !== "POST") return json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null }, 405, { Allow: "POST, OPTIONS" });
  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try { return withCors(await transport.handleRequest(req)); }
  catch (e) { return json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null }, 500); }
};

export const config = { path: ["/mcp", "/api/mcp"] };
