/** Standard day length for OT/UT (unchanged). */
export const STANDARD_DAY_HOURS = 9;

/** Inclusive upper bound for half day: (0, MAX_HOURS_HALF_DAY] → half; above → present. */
export const MAX_HOURS_HALF_DAY = 6;

export function statusFromWorkedHours(
  workHours: number
): "PRESENT" | "HALF" | "ABSENT" {
  if (workHours <= 0) return "ABSENT";
  if (workHours <= MAX_HOURS_HALF_DAY) return "HALF";
  return "PRESENT";
}

/**
 * Uses worked hours when positive so grid/CSV/PDF match the rule even if DB status is stale.
 * When no time worked, keeps stored status (ABSENT, HOLIDAY, etc.).
 */
export function effectiveAttendanceStatus(
  workHours: number,
  storedStatus: string
): string {
  const w = workHours || 0;
  if (w <= 0) return storedStatus;
  if (w <= MAX_HOURS_HALF_DAY) return "HALF";
  return "PRESENT";
}
