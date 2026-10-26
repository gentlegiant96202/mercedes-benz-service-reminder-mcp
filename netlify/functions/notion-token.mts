// Notion OAuth token exchange for the Mercedes-Benz Service Reminder Chrome extension.
// Keeps the Notion client secret server-side. Stores nothing.
//
// POST /notion/token  { "code": "...", "redirect_uri": "https://<ext-id>.chromiumapp.org/" }
// POST /notion/token  { "refresh_token": "..." }
//
// Env vars (Netlify site settings):
//   NOTION_CLIENT_ID       OAuth client ID from the Notion Developer portal
//   NOTION_CLIENT_SECRET   OAuth client secret (secret!)
//   ALLOWED_REDIRECT_URIS  comma-separated allow-list, e.g. https://hbbfgmbaienfihaliefelfheigelcalj.chromiumapp.org/
//   ALLOWED_ORIGINS        optional, comma-separated, e.g. chrome-extension://hbbfgmbaienfihaliefelfheigelcalj

const list = (v?: string) => (v || "").split(",").map((s) => s.trim()).filter(Boolean);

export default async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = list(process.env.ALLOWED_ORIGINS);
  const cors: Record<string, string> = {
    "Access-Control-Allow-Origin": allowedOrigins.length ? (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]) : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...cors } });

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return reply({ error: "method_not_allowed" }, 405);
  if (allowedOrigins.length && !allowedOrigins.includes(origin)) return reply({ error: "origin_not_allowed" }, 403);

  const id = process.env.NOTION_CLIENT_ID;
  const secret = process.env.NOTION_CLIENT_SECRET;
  if (!id || !secret) return reply({ error: "server_not_configured" }, 500);

  let input: { code?: string; redirect_uri?: string; refresh_token?: string };
  try { input = await req.json(); } catch { return reply({ error: "invalid_json" }, 400); }

  let payload: Record<string, string>;
  if (input.refresh_token) {
    payload = { grant_type: "refresh_token", refresh_token: String(input.refresh_token) };
  } else if (input.code && input.redirect_uri) {
    const allowed = list(process.env.ALLOWED_REDIRECT_URIS);
    if (allowed.length && !allowed.includes(input.redirect_uri)) return reply({ error: "redirect_uri_not_allowed" }, 400);
    payload = { grant_type: "authorization_code", code: String(input.code), redirect_uri: input.redirect_uri };
  } else {
    return reply({ error: "missing_code_or_refresh_token" }, 400);
  }

  const res = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
    },
    body: JSON.stringify(payload),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) return reply({ error: data.error || "token_exchange_failed", message: data.error_description || data.message }, res.status);

  // Return only what the extension needs.
  return reply({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    bot_id: data.bot_id,
    workspace_id: data.workspace_id,
    workspace_name: data.workspace_name,
    workspace_icon: data.workspace_icon,
    duplicated_template_id: data.duplicated_template_id ?? null,
  });
};

export const config = { path: "/notion/token" };
