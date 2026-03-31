/** Standard day length for OT/UT (unchanged). */
export const STANDARD_DAY_HOURS = 9;

/** Inclusive upper bound for half day: (0, MAX_HOURS_HALF_DAY] → half; above → present. */
export const MAX_HOURS_HALF_DAY = 6;

export function toFiniteWorkHours(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Calendar day 1–31 from API date string (YYYY-MM-DD) without local timezone shift.
 * `new Date("YYYY-MM-DD").getDate()` uses UTC midnight and can show the previous calendar day in western zones.
 */
export function calendarDayFromApiDate(isoDate: string): number {
  const datePart = isoDate.split("T")[0] ?? isoDate;
  const parts = datePart.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    if (Number.isFinite(day)) return day;
  }
  return new Date(isoDate).getDate();
}

/** Same duration rule as AttendanceModal; supports "HH:MM" or "HH:MM:SS" from API. */
export function hoursFromCheckInOut(
  checkIn: string | null | undefined,
  checkOut: string | null | undefined
): number | null {
  if (!checkIn || !checkOut) return null;
  const toMinutes = (t: string) => {
    const parts = t.trim().split(":");
    if (parts.length < 2) return null;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return h * 60 + m;
  };
  const inM = toMinutes(checkIn);
  const outM = toMinutes(checkOut);
  if (inM == null || outM == null) return null;
  const mins = outM - inM;
  if (mins <= 0) return null;
  return +(mins / 60).toFixed(2);
}

/**
 * Prefer punch-derived hours when valid (matches modal); otherwise stored work_hours.
 */
export function resolveWorkedHoursForDisplay(record: {
  work_hours?: unknown;
  check_in?: string | null;
  check_out?: string | null;
}): number {
  const wh = toFiniteWorkHours(record.work_hours);
  const fromPunches = hoursFromCheckInOut(record.check_in, record.check_out);
  if (fromPunches != null && fromPunches > 0) return fromPunches;
  return wh;
}

export function statusFromWorkedHours(
  workHours: number
): "PRESENT" | "HALF" | "ABSENT" {
  const w = toFiniteWorkHours(workHours);
  if (w <= 0) return "ABSENT";
  if (w <= MAX_HOURS_HALF_DAY) return "HALF";
  return "PRESENT";
}

/**
 * Uses numeric work hours when positive (stale-safe if value is correct).
 */
export function effectiveAttendanceStatus(
  workHours: unknown,
  storedStatus: string
): string {
  const w = toFiniteWorkHours(workHours);
  if (w <= 0) return storedStatus;
  if (w <= MAX_HOURS_HALF_DAY) return "HALF";
  return "PRESENT";
}

/**
 * Grid / CSV / PDF: same hours the modal uses — punches first, then stored work_hours.
 */
export function effectiveAttendanceStatusFromRecord(record: {
  work_hours?: unknown;
  check_in?: string | null;
  check_out?: string | null;
  status: string;
}): string {
  const w = resolveWorkedHoursForDisplay(record);
  if (w <= 0) return record.status;
  if (w <= MAX_HOURS_HALF_DAY) return "HALF";
  return "PRESENT";
}
