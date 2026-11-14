import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DEMO_HORIZON_DAYS,
  practiceDateKey,
  shiftMonth,
} from "@private-practice/shared";

type MonthlyCalendarProps = {
  month: string;
  selectedDate: string;
  availableDates: Set<string>;
  disabled: boolean;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
};

export function MonthlyCalendar({
  month,
  selectedDate,
  availableDates,
  disabled,
  onMonthChange,
  onDateChange,
}: MonthlyCalendarProps) {
  const first = new Date(`${month}-01T12:00:00Z`);
  const year = first.getUTCFullYear();
  const monthIndex = first.getUTCMonth();
  const padding = first.getUTCDay();
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  const currentMonth = practiceDateKey(Date.now()).slice(0, 7);
  const lastMonth = practiceDateKey(
    Date.now() + DEMO_HORIZON_DAYS * 86_400_000,
  ).slice(0, 7);

  const heading = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(first);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold" aria-live="polite">
          {heading}
        </h2>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous month"
            disabled={disabled || month <= currentMonth}
            onClick={() => onMonthChange(shiftMonth(month, -1))}
            className="flex size-11 items-center justify-center rounded-full border border-line disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label="Next month"
            disabled={disabled || month >= lastMonth}
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            className="flex size-11 items-center justify-center rounded-full border border-line disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mt-6 grid grid-cols-7 text-center text-xs text-ink-muted"
      >
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span key={day} className="py-3">
            {day}
          </span>
        ))}
      </div>

      <div
        role="group"
        aria-label={`Available appointment dates in ${heading}`}
        className="grid grid-cols-7 gap-1"
      >
        {Array.from({ length: padding }, (_, index) => (
          <span key={`padding-${index}`} aria-hidden="true" />
        ))}

        {Array.from({ length: days }, (_, index) => {
          const day = index + 1;
          const key = `${month}-${String(day).padStart(2, "0")}`;
          const available = availableDates.has(key);
          const selected = selectedDate === key;

          const label = new Intl.DateTimeFormat("en-US", {
            timeZone: "UTC",
            dateStyle: "full",
          }).format(new Date(`${key}T12:00:00Z`));

          return (
            <button
              key={key}
              type="button"
              disabled={disabled || !available}
              aria-pressed={selected}
              aria-label={`${label}, ${available ? "available" : "unavailable"}`}
              onClick={() => onDateChange(key)}
              className={`relative min-h-11 rounded-xl py-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                selected
                  ? "bg-navy font-semibold text-white"
                  : available
                    ? "bg-sage/60 font-semibold text-navy hover:bg-sage"
                    : "text-ink-muted"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="type-caption mt-5">
        Sage dates have available demo slots. Dates and times use the
        example practice time zone.
      </p>
    </div>
  );
}