export const DEMO_TIME_ZONE = "America/New_York";

export const DEMO_IDENTITIES = [
  "synthetic-a",
  "synthetic-b",
  "synthetic-c",
] as const;

export const DEMO_SLOT_MINUTES = 30;
export const DEMO_HORIZON_DAYS = 60;

function dateParts(timestamp: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DEMO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(timestamp);

  const read = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

export function practiceDateKey(timestamp: number): string {
  const parts = dateParts(timestamp);

  return [
    String(parts.year).padStart(4, "0"),
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
}

export function addCalendarDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function shiftMonth(monthKey: string, amount: number): string {
  const date = new Date(`${monthKey}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 7);
}

export function localPracticeTimeToUtc(
  dateKey: string,
  hour: number,
  minute: number,
): number {
  const [year = 0, month = 1, day = 1] = dateKey
    .split("-")
    .map(Number);

  const desired = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = desired;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = dateParts(candidate);
    const represented = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
    );

    const difference = desired - represented;

    if (difference === 0) {
      return candidate;
    }

    candidate += difference;
  }

  throw new Error("The configured local appointment time is not valid.");
}

export function formatPracticeTime(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: DEMO_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(timestamp);
}

export function formatAppointment(
  timestamp: number,
  timeZone = DEMO_TIME_ZONE,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}