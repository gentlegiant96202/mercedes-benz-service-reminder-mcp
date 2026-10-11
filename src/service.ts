// Date/mileage logic ported from the SilberArrows Chrome extension (src/lib/service.js).
// Calendar days are handled in UTC to avoid DST/time-zone drift.

export const DEFAULT_INTERVAL_MONTHS = 12;
export const DEFAULT_INTERVAL_KM = 15000;
export const DUE_SOON_DAYS = 30;
export const DUE_SOON_KM = 1500;
const DAY_MS = 86400000;

export const DISCLAIMER =
  "Intervals are general guidance only (approximately 15,000 km or 12 months, whichever comes first, on most models). " +
  "Always follow your Mercedes-Benz's own service indicator (ASSYST) and the manufacturer's schedule for your model, as requirements vary with model, age, mileage and driving conditions.";

export function parseISODate(str: string): Date | null {
  if (typeof str !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const [y, m, d] = str.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}
export const toISODate = (dt: Date): string => dt.toISOString().slice(0, 10);
export const todayUTC = (now: Date = new Date()): Date => new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

export function addMonths(dt: Date, months: number): Date {
  const target = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(dt.getUTCDate(), lastDay));
  return target;
}
export const daysBetween = (a: Date, b: Date): number => Math.round((b.getTime() - a.getTime()) / DAY_MS);
export const nextServiceType = (last: string): "A" | "B" => (String(last).toUpperCase() === "A" ? "B" : "A");

export interface NextServiceInput {
  lastServiceType: "A" | "B";
  lastServiceDate: string;
  lastServiceKm: number;
  currentKm?: number;
  intervalMonths?: number;
  intervalKm?: number;
}

export type NextServiceResult =
  | { ok: false; error: string }
  | {
      ok: true;
      nextType: "A" | "B";
      dueDateByTime: string;
      dueKm: number;
      estimatedDueDate: string;
      dueBy: "time" | "mileage";
      daysRemaining: number;
      kmRemaining: number | null;
      status: "ok" | "due-soon" | "overdue";
      intervalMonths: number;
      intervalKm: number;
      summary: string;
      disclaimer: string;
    };

export function computeNextService(input: NextServiceInput, now: Date = new Date()): NextServiceResult {
  const last = parseISODate(input.lastServiceDate);
  if (!last) return { ok: false, error: "Please provide a valid last service date (YYYY-MM-DD)." };
  const today = todayUTC(now);
  if (last > today) return { ok: false, error: "Last service date cannot be in the future." };
  const lastType = String(input.lastServiceType || "").toUpperCase();
  if (lastType !== "A" && lastType !== "B") return { ok: false, error: "Last service type must be A or B." };
  const intervalMonths = Math.round(input.intervalMonths ?? DEFAULT_INTERVAL_MONTHS);
  const intervalKm = Math.round(input.intervalKm ?? DEFAULT_INTERVAL_KM);
  if (intervalMonths < 1 || intervalMonths > 36) return { ok: false, error: "Interval must be between 1 and 36 months." };
  if (intervalKm < 1000 || intervalKm > 50000) return { ok: false, error: "Interval must be between 1,000 and 50,000 km." };
  const lastKm = input.lastServiceKm;
  if (!(lastKm >= 0)) return { ok: false, error: "Mileage at last service must be zero or more." };
  const currentKm = input.currentKm ?? null;
  if (currentKm !== null && lastKm > currentKm)
    return { ok: false, error: "Mileage at last service cannot exceed current mileage." };

  const dueByTime = addMonths(last, intervalMonths);
  let dueDate = dueByTime;
  let dueBy: "time" | "mileage" = "time";
  const dueKm = lastKm + intervalKm;
  let kmRemaining: number | null = null;

  if (currentKm !== null) {
    kmRemaining = dueKm - currentKm;
    const daysSince = daysBetween(last, today);
    const driven = currentKm - lastKm;
    if (kmRemaining <= 0) {
      if (today < dueDate) { dueDate = today; dueBy = "mileage"; }
    } else if (daysSince > 0 && driven > 0) {
      const perDay = driven / daysSince;
      const kmDate = new Date(today.getTime() + Math.ceil(kmRemaining / perDay) * DAY_MS);
      if (kmDate < dueDate) { dueDate = kmDate; dueBy = "mileage"; }
    }
  }

  const daysRemaining = daysBetween(today, dueDate);
  let status: "ok" | "due-soon" | "overdue" = "ok";
  if (daysRemaining < 0 || (kmRemaining !== null && kmRemaining <= 0)) status = "overdue";
  else if (daysRemaining <= DUE_SOON_DAYS || (kmRemaining !== null && kmRemaining <= DUE_SOON_KM)) status = "due-soon";

  const nextType = nextServiceType(lastType);
  const fmt = (n: number) => n.toLocaleString("en-GB");
  let summary = `Next service: Service ${nextType}, due by ${toISODate(dueByTime)} or ${fmt(dueKm)} km, whichever comes first.`;
  if (currentKm !== null) {
    if (status === "overdue") summary += daysRemaining < 0 ? ` It is overdue by ${-daysRemaining} day(s).` : " It is due now (mileage interval reached).";
    else summary += ` Based on your driving so far, it is estimated for ${toISODate(dueDate)} (${daysRemaining} day(s), ${fmt(kmRemaining!)} km remaining).`;
  } else if (status === "overdue") summary += ` It is overdue by ${-daysRemaining} day(s).`;
  else summary += ` ${daysRemaining} day(s) remaining by time.`;

  return {
    ok: true, nextType, dueDateByTime: toISODate(dueByTime), dueKm, estimatedDueDate: toISODate(dueDate), dueBy,
    daysRemaining, kmRemaining, status, intervalMonths, intervalKm, summary, disclaimer: DISCLAIMER,
  };
}
