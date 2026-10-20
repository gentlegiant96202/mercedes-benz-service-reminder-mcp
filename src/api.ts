import { computeNextService, DISCLAIMER } from "./service.js";
import { SERVICES, WARNING_LIGHTS, SPECIALIST } from "./data.js";

export type ApiResult = { status: number; body: unknown };

function parseNumber(raw: string | null): number | undefined {
  if (raw === null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

export function handleNextService(params: URLSearchParams): ApiResult {
  const lastServiceType = (params.get("last_service_type") ?? "").trim().toUpperCase();
  const lastServiceDate = (params.get("last_service_date") ?? "").trim();
  const lastServiceKm = parseNumber(params.get("last_service_km"));
  const currentKm = parseNumber(params.get("current_km"));
  const intervalMonths = parseNumber(params.get("interval_months"));
  const intervalKm = parseNumber(params.get("interval_km"));

  if (!lastServiceType) return { status: 400, body: { ok: false, error: "Missing required query parameter: last_service_type (A or B)." } };
  if (!lastServiceDate) return { status: 400, body: { ok: false, error: "Missing required query parameter: last_service_date (YYYY-MM-DD)." } };
  if (lastServiceKm === undefined) return { status: 400, body: { ok: false, error: "Missing required query parameter: last_service_km." } };
  if (Number.isNaN(lastServiceKm)) return { status: 400, body: { ok: false, error: "last_service_km must be a number." } };
  if (currentKm !== undefined && Number.isNaN(currentKm)) return { status: 400, body: { ok: false, error: "current_km must be a number." } };
  if (intervalMonths !== undefined && Number.isNaN(intervalMonths)) return { status: 400, body: { ok: false, error: "interval_months must be a number." } };
  if (intervalKm !== undefined && Number.isNaN(intervalKm)) return { status: 400, body: { ok: false, error: "interval_km must be a number." } };

  const result = computeNextService({
    lastServiceType: lastServiceType as "A" | "B",
    lastServiceDate,
    lastServiceKm,
    currentKm,
    intervalMonths,
    intervalKm,
  });
  return { status: result.ok ? 200 : 400, body: result };
}

export function handleServiceInfo(params: URLSearchParams): ApiResult {
  const service = (params.get("service") ?? "").trim().toUpperCase();
  if (service !== "A" && service !== "B") {
    return { status: 400, body: { ok: false, error: "Query parameter service must be A or B." } };
  }
  return { status: 200, body: { ok: true, ...SERVICES[service], disclaimer: DISCLAIMER } };
}

export function handleWarningLight(params: URLSearchParams): ApiResult {
  const note =
    "General information only, not a diagnosis. If in doubt, stop when it is safe to do so and consult your owner's manual or a Mercedes-Benz specialist.";
  const light = params.get("light");
  if (light === null || light.trim() === "") {
    return { status: 200, body: { ok: true, covered: Object.values(WARNING_LIGHTS).map((w) => w.name), note } };
  }
  const q = light.toLowerCase().trim();
  const scored = Object.entries(WARNING_LIGHTS)
    .map(([id, w]) => ({
      id,
      w,
      s: Math.max(0, ...w.aliases.map((al) => (q === al ? 100 : q.includes(al) ? al.length : al.includes(q) ? q.length / 2 : 0))),
    }))
    .sort((x, y) => y.s - x.s);
  if (scored[0].s === 0) {
    return {
      status: 404,
      body: { ok: true, found: false, message: `No entry for "${light}".`, covered: Object.values(WARNING_LIGHTS).map((w) => w.name), note },
    };
  }
  const { id, w } = scored[0];
  return {
    status: 200,
    body: {
      ok: true,
      found: true,
      id,
      name: w.name,
      meaning: w.meaning,
      advice: w.advice,
      note,
      specialist: `${SPECIALIST.name}, ${SPECIALIST.phone}`,
    },
  };
}

export function handleContact(): ApiResult {
  return { status: 200, body: { ok: true, ...SPECIALIST } };
}
