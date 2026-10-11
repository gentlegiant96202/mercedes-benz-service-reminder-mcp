#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { computeNextService, DISCLAIMER } from "./service.js";
import { SERVICES, WARNING_LIGHTS, SPECIALIST } from "./data.js";

const server = new McpServer({ name: "Mercedes-Benz Service Reminder – SilberArrows", version: "1.0.0" });
const out = (obj: unknown, isError = false) => ({ content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }], isError });

server.tool(
  "get_next_service",
  "Estimate the next Mercedes-Benz service (alternating Service A/B, ASSYST-style) from the last service type, date and mileage. Default interval: 15,000 km or 12 months, whichever comes first.",
  {
    last_service_type: z.enum(["A", "B", "a", "b"]).describe("Type of the last service: A or B"),
    last_service_date: z.string().describe("Date of the last service, YYYY-MM-DD"),
    last_service_km: z.number().nonnegative().describe("Odometer reading at the last service, in km"),
    current_km: z.number().nonnegative().optional().describe("Current odometer reading in km (optional; improves the estimate)"),
    interval_months: z.number().int().min(1).max(36).optional().describe("Override time interval (default 12)"),
    interval_km: z.number().int().min(1000).max(50000).optional().describe("Override distance interval (default 15000)"),
  },
  async (a) => {
    const r = computeNextService({
      lastServiceType: a.last_service_type.toUpperCase() as "A" | "B", lastServiceDate: a.last_service_date,
      lastServiceKm: a.last_service_km, currentKm: a.current_km, intervalMonths: a.interval_months, intervalKm: a.interval_km,
    });
    return out(r, !r.ok);
  }
);

server.tool(
  "explain_service",
  "Explain what a Mercedes-Benz Service A or Service B typically includes.",
  { service: z.enum(["A", "B", "a", "b"]).describe("A or B") },
  async ({ service }) => out({ ...SERVICES[service.toUpperCase() as "A" | "B"], disclaimer: DISCLAIMER })
);

server.tool(
  "warning_light_info",
  "General guidance on common Mercedes-Benz warning lights and messages. Omit 'light' to list those covered.",
  { light: z.string().optional().describe("e.g. 'check engine', 'flashing check engine', 'limp mode', 'ABS', 'ESP', 'battery', 'service due'") },
  async ({ light }) => {
    const note = "General information only, not a diagnosis. If in doubt, stop when it is safe to do so and consult your owner's manual or a Mercedes-Benz specialist.";
    if (!light) return out({ covered: Object.values(WARNING_LIGHTS).map((w) => w.name), note });
    const q = light.toLowerCase().trim();
    const scored = Object.entries(WARNING_LIGHTS)
      .map(([id, w]) => ({ id, w, s: Math.max(0, ...w.aliases.map((al) => (q === al ? 100 : q.includes(al) ? al.length : al.includes(q) ? q.length / 2 : 0))) }))
      .sort((x, y) => y.s - x.s);
    if (scored[0].s === 0) return out({ found: false, message: `No entry for "${light}".`, covered: Object.values(WARNING_LIGHTS).map((w) => w.name), note });
    const { id, w } = scored[0];
    return out({ found: true, id, name: w.name, meaning: w.meaning, advice: w.advice, note, specialist: `${SPECIALIST.name}, ${SPECIALIST.phone}` });
  }
);

server.tool(
  "find_specialist",
  "Contact details for SilberArrows, a Mercedes-Benz service centre in Al Quoz, Dubai.",
  {},
  async () => out(SPECIALIST)
);

await server.connect(new StdioServerTransport());
