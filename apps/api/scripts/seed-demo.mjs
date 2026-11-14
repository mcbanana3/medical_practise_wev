import { mkdir, writeFile } from "node:fs/promises";
import {
  DEMO_HORIZON_DAYS,
  DEMO_SLOT_MINUTES,
  DEMO_TIME_ZONE,
  addCalendarDays,
  localPracticeTimeToUtc,
  practiceDateKey,
} from "../../../packages/shared/src/constants/demo-scheduling.ts";

const today = practiceDateKey(Date.now());
const statements = [];

for (let day = 0; day <= DEMO_HORIZON_DAYS; day += 1) {
  const dateKey = addCalendarDays(today, day);
  const weekday = new Date(`${dateKey}T12:00:00Z`).getUTCDay();

  if (weekday === 0 || weekday === 6) {
    continue;
  }

  for (let minuteOfDay = 9 * 60; minuteOfDay < 17 * 60; minuteOfDay += 30) {
    const hour = Math.floor(minuteOfDay / 60);
    const minute = minuteOfDay % 60;

    const startAt = localPracticeTimeToUtc(dateKey, hour, minute);
    const endAt = startAt + DEMO_SLOT_MINUTES * 60_000;

    if (startAt <= Date.now()) {
      continue;
    }

    statements.push(
      `INSERT OR IGNORE INTO demo_slots ` +
        `(id, start_at, end_at, local_date, is_open) VALUES ` +
        `('slot-${startAt}', ${startAt}, ${endAt}, '${dateKey}', 1);`,
    );
  }
}

const directory = new URL("../seeds/development/", import.meta.url);
await mkdir(directory, { recursive: true });

await writeFile(
  new URL("slots.sql", directory),
  [
    "-- Synthetic development availability only.",
    `-- Example practice time zone: ${DEMO_TIME_ZONE}`,
    ...statements,
    "",
  ].join("\n"),
);

console.log(`Generated ${statements.length} synthetic slots.`);
console.log(`Example time zone: ${DEMO_TIME_ZONE}`);
console.log("No database has been modified yet.");