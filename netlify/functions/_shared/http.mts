export const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, X-API-Key",
  "Access-Control-Expose-Headers": "Content-Type",
};

export const handleOptions = (): Response => new Response(null, { status: 204, headers: CORS });

export const json = (body: unknown, status = 200, extra: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...CORS, ...extra },
  });

export async function handleGet(
  req: Request,
  run: (params: URLSearchParams) => { status: number; body: unknown }
): Promise<Response> {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "GET") return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "GET, OPTIONS" });
  const result = run(new URL(req.url).searchParams);
  return json(result.body, result.status);
}
