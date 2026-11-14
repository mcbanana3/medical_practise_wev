import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays, LoaderCircle, RefreshCw } from "lucide-react";
import {
  DEMO_IDENTITIES,
  DEMO_TIME_ZONE,
  demoAvailabilitySchema,
  demoBookingRequestSchema,
  demoBookingResponseSchema,
  demoSessionSchema,
  formatAppointment,
  formatPracticeTime,
  practiceDateKey,
} from "@private-practice/shared";
import type {
  DemoBooking,
  DemoBookingResponse,
  DemoSession,
  DemoSlot,
} from "@private-practice/shared";
import {
  PageIntro,
  PracticeLayout,
} from "../components/layout/PracticeLayout";
import { Container } from "../components/layout/Container";
import { Button } from "../components/ui/Button";
import { Card, EmptyState } from "../components/ui/Card";
import { ContentNotice } from "../components/ui/ContentNotice";
import { Dialog } from "../components/ui/Dialog";
import {
  CheckboxField,
  SelectField,
  TextField,
} from "../components/ui/FormField";
import { MonthlyCalendar } from "../features/appointments/MonthlyCalendar";
import { DemoApiError, demoRequest } from "../features/appointments/api";

const storageKey = "private-practice-demo-session-v1";

type Availability =
  | { status: "loading" }
  | { status: "success"; slots: DemoSlot[] }
  | { status: "error"; message: string };

type Action = "create" | "refresh" | "cancel" | "reschedule";

type FormErrors = {
  slot?: string;
  identity?: string;
  acknowledged?: string;
};

function readSession(): DemoSession | null {
  try {
    const raw = sessionStorage.getItem(storageKey);

    if (!raw) {
      return null;
    }

    const result = demoSessionSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function newToken() {
  return (
    crypto.randomUUID().replaceAll("-", "") +
    crypto.randomUUID().replaceAll("-", "")
  );
}

export default function AppointmentsPage() {
  const [month, setMonth] = useState(
    practiceDateKey(Date.now()).slice(0, 7),
  );
  const [availability, setAvailability] = useState<Availability>({
    status: "loading",
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [identity, setIdentity] = useState("synthetic-a");
  const [acknowledged, setAcknowledged] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [session, setSession] = useState<DemoSession | null>(readSession);
  const [booking, setBooking] = useState<DemoBooking | null>(null);
  const [busy, setBusy] = useState<Action | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const visitorTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    let active = true;

    demoRequest(
      `/slots?month=${encodeURIComponent(month)}`,
      demoAvailabilitySchema,
    )
      .then((result) => {
        if (active) {
          setAvailability({
            status: "success",
            slots: result.slots,
          });
        }
      })
      .catch((failure: unknown) => {
        if (active) {
          setAvailability({
            status: "error",
            message:
              failure instanceof Error
                ? failure.message
                : "Availability could not be loaded.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [month, reloadKey]);

  const slots =
    availability.status === "success" ? availability.slots : [];

  const dateSlots = slots.filter(
    (slot) => slot.dateKey === selectedDate,
  );

  const selectedSlot = slots.find(
    (slot) => slot.id === selectedSlotId,
  );

  const availableDates = new Set(slots.map((slot) => slot.dateKey));

  function updateSession(value: DemoSession | null) {
    setSession(value);

    try {
      if (value) {
        sessionStorage.setItem(storageKey, JSON.stringify(value));
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch {
      // Browser-memory operation still works if storage is unavailable.
    }
  }

  function refreshAvailability() {
    setAvailability({ status: "loading" });
    setReloadKey((value) => value + 1);
  }

  async function perform(
    action: Action,
    task: () => Promise<DemoBookingResponse>,
  ) {
    if (busy) {
      return;
    }

    setBusy(action);
    setError("");
    setFeedback("");

    try {
      const result = await task();

      setBooking(result.booking);
      setUncertain(false);
      setRescheduling(false);
      setSelectedSlotId("");
      setAcknowledged(false);
      setFormErrors({});
      setFeedback(
        `Backend reports: demo reservation ${result.booking.status}. No real medical appointment has been scheduled.`,
      );

      refreshAvailability();
    } catch (failure) {
      const message =
        failure instanceof Error
          ? failure.message
          : "The operation could not be verified.";

      setError(message);
      setUncertain(true);

      if (
        action === "create" &&
        failure instanceof DemoApiError &&
        [400, 409].includes(failure.status)
      ) {
        updateSession(null);
        setUncertain(false);
        refreshAvailability();
      }

      if (
        action === "refresh" &&
        failure instanceof DemoApiError &&
        failure.status === 404
      ) {
        updateSession(null);
        setBooking(null);
        setUncertain(false);
      }
    } finally {
      setBusy(null);
    }
  }

  function changeMonth(value: string) {
    setMonth(value);
    setSelectedDate("");
    setSelectedSlotId("");
    setAvailability({ status: "loading" });
    setFormErrors({});
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!selectedSlot) {
      nextErrors.slot = "Choose an available date and time.";
    }

    if (!DEMO_IDENTITIES.some((value) => value === identity)) {
      nextErrors.identity = "Choose a synthetic identity.";
    }

    if (!acknowledged) {
      nextErrors.acknowledged =
        "Confirm that this is a synthetic demonstration only.";
    }

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      });
      return;
    }

    if (!selectedSlot) {
      return;
    }

    if (rescheduling && session && booking) {
      void perform("reschedule", () =>
        demoRequest(
          `/bookings/${booking.bookingId}/reschedule`,
          demoBookingResponseSchema,
          {
            token: session.token,
            body: {
              slotId: selectedSlot.id,
              expectedVersion: booking.version,
              acknowledged: true,
            },
          },
        ),
      );
      return;
    }

    const result = demoBookingRequestSchema.safeParse({
      bookingId: crypto.randomUUID(),
      slotId: selectedSlot.id,
      demoIdentity: identity,
      acknowledged,
    });

    if (!result.success) {
      setError("The demo request is invalid. Check the selected fields.");
      return;
    }

    const nextSession: DemoSession = {
      request: result.data,
      token: newToken(),
    };

    // Save the request identifier before sending it, so a retry can
    // reuse the same identity instead of creating another reservation.
    updateSession(nextSession);

    void perform("create", () =>
      demoRequest("/bookings", demoBookingResponseSchema, {
        token: nextSession.token,
        body: nextSession.request,
      }),
    );
  }

  function refreshBooking() {
    if (!session) {
      return;
    }

    void perform("refresh", () =>
      demoRequest(
        `/bookings/${session.request.bookingId}`,
        demoBookingResponseSchema,
        { token: session.token },
      ),
    );
  }

  function retryCreation() {
    if (!session) {
      return;
    }

    void perform("create", () =>
      demoRequest("/bookings", demoBookingResponseSchema, {
        token: session.token,
        body: session.request,
      }),
    );
  }

  function cancelBooking() {
    if (!session || !booking) {
      return;
    }

    setCancelOpen(false);

    void perform("cancel", () =>
      demoRequest(
        `/bookings/${booking.bookingId}/cancel`,
        demoBookingResponseSchema,
        {
          token: session.token,
          body: { expectedVersion: booking.version },
        },
      ),
    );
  }

  const showRequestForm =
    !session || (booking?.status === "confirmed" && rescheduling);

  return (
    <PracticeLayout title="Demo Appointments">
      <PageIntro
        eyebrow="Synthetic scheduling demonstration"
        title="Choose a time. Understand every step."
        description="Explore a complete reservation workflow using synthetic identities. Nothing on this page creates a real medical appointment."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <ContentNotice title="Local demonstration only">
            <p>
              Example practice time zone: {DEMO_TIME_ZONE}. The doctor’s
              US location has not been verified. Hours are synthetic:
              weekdays, 9am–5pm, in fixed 30-minute slots.
            </p>
            <p className="mt-2">
              Your browser time zone: {visitorTimeZone}. Do not enter
              patient information. Keep this tab open; session recovery
              depends on your browser allowing session storage.
            </p>
          </ContentNotice>

          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mt-6"
          >
            {busy && (
              <p className="flex items-center gap-2 text-sm">
                <LoaderCircle
                  size={17}
                  className="motion-safe:animate-spin"
                  aria-hidden="true"
                />
                Contacting the local backend…
              </p>
            )}

            {feedback && (
              <p className="rounded-2xl bg-sage/60 p-5 text-sm leading-7">
                {feedback}
              </p>
            )}

            {error && (
              <div className="rounded-2xl bg-danger-soft p-5 text-sm leading-7 text-danger">
                <p>{error}</p>
                {uncertain && (
                  <p className="mt-2">
                    The outcome may be uncertain. Refresh reservation
                    status before trying another management action.
                  </p>
                )}
              </div>
            )}
          </div>

          {session && (
            <Card className="mt-8">
              <p className="type-eyebrow">Demo reservation management</p>

              {!booking ? (
                <>
                  <h2 className="type-title mt-4">
                    A saved demo request is available.
                  </h2>
                  <p className="type-body mt-4">
                    Check its backend status. If creation was interrupted,
                    retrying this saved request uses the same identifier.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button disabled={!!busy} onClick={refreshBooking}>
                      Check saved request
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={!!busy}
                      onClick={retryCreation}
                    >
                      Retry saved request
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="type-title mt-4">
                    {booking.status === "confirmed"
                      ? "Demo reservation confirmed by backend."
                      : "Demo reservation cancelled."}
                  </h2>

                  <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        Example practice time
                      </dt>
                      <dd className="mt-2 text-sm leading-7">
                        {formatAppointment(booking.slot.startAt)}
                        <br />
                        {DEMO_TIME_ZONE}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        Your browser time
                      </dt>
                      <dd className="mt-2 text-sm leading-7">
                        {formatAppointment(
                          booking.slot.startAt,
                          visitorTimeZone,
                        )}
                        <br />
                        {visitorTimeZone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        Synthetic identity
                      </dt>
                      <dd className="mt-2 text-sm">
                        {booking.demoIdentity}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        Server version
                      </dt>
                      <dd className="mt-2 text-sm">{booking.version}</dd>
                    </div>
                  </dl>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      disabled={!!busy}
                      onClick={refreshBooking}
                    >
                      <RefreshCw size={16} aria-hidden="true" />
                      Refresh status
                    </Button>

                    {booking.status === "confirmed" && (
                      <>
                        <Button
                          disabled={!!busy || uncertain}
                          onClick={() => {
                            setRescheduling(true);
                            setSelectedSlotId("");
                            setAcknowledged(false);
                            setFormErrors({});
                            setFeedback(
                              "Choose a different date and time below. Your existing slot remains reserved until the backend successfully moves it.",
                            );
                          }}
                        >
                          Reschedule demo
                        </Button>

                        <Button
                          variant="ghost"
                          disabled={!!busy || uncertain}
                          onClick={() => setCancelOpen(true)}
                        >
                          Cancel demo reservation
                        </Button>
                      </>
                    )}

                    {booking.status === "cancelled" && (
                      <Button
                        disabled={!!busy}
                        onClick={() => {
                          updateSession(null);
                          setBooking(null);
                          setRescheduling(false);
                          setSelectedSlotId("");
                          setAcknowledged(false);
                          setFeedback("");
                          setError("");
                          setUncertain(false);
                        }}
                      >
                        Start another demo
                      </Button>
                    )}
                  </div>
                </>
              )}
            </Card>
          )}

          <div className="mt-10 grid items-start gap-7 lg:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <MonthlyCalendar
                month={month}
                selectedDate={selectedDate}
                availableDates={availableDates}
                disabled={!!busy || availability.status === "loading"}
                onMonthChange={changeMonth}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  setSelectedSlotId("");
                  setFormErrors({});
                }}
              />

              <div
                className="mt-7 border-t border-line pt-6"
                role="status"
                aria-live="polite"
              >
                {availability.status === "loading" && (
                  <p className="type-caption">Loading available dates…</p>
                )}

                {availability.status === "error" && (
                  <>
                    <p className="text-sm leading-7 text-danger">
                      {availability.message}
                    </p>
                    <Button
                      variant="secondary"
                      className="mt-4"
                      onClick={refreshAvailability}
                    >
                      Retry availability
                    </Button>
                  </>
                )}

                {availability.status === "success" &&
                  slots.length === 0 && (
                    <p className="type-caption">
                      No available demo slots in this month. Try another
                      month or regenerate the local seed.
                    </p>
                  )}

                {availability.status === "success" &&
                  slots.length > 0 && (
                    <p className="type-caption">
                      {slots.length} available demo slots in this month.
                    </p>
                  )}
              </div>

              <div className="mt-7 border-t border-line pt-6">
                <h3 className="text-sm font-semibold">
                  {selectedDate
                    ? `Available times · ${selectedDate}`
                    : "Choose an available date"}
                </h3>

                {selectedDate && dateSlots.length > 0 ? (
                  <div
                    role="group"
                    aria-label="Available appointment times"
                    className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"
                  >
                    {dateSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!!busy}
                        aria-pressed={selectedSlotId === slot.id}
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          setFormErrors({});
                        }}
                        className={`min-h-12 rounded-xl border px-3 py-3 text-sm disabled:opacity-50 ${
                          selectedSlotId === slot.id
                            ? "border-navy bg-navy text-white"
                            : "border-line bg-white hover:bg-warm"
                        }`}
                      >
                        {formatPracticeTime(slot.startAt)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="type-caption mt-3">
                    {selectedDate
                      ? "No available slots remain on this date."
                      : "Available times will appear here."}
                  </p>
                )}
              </div>
            </Card>

            {showRequestForm ? (
              <Card tone="warm">
                <p className="type-eyebrow">
                  {rescheduling ? "Move a demo reservation" : "Request a demo slot"}
                </p>

                <h2 className="type-title mt-4">
                  {rescheduling
                    ? "Choose the new time."
                    : "Synthetic details only."}
                </h2>

                <form
                  ref={formRef}
                  noValidate
                  onSubmit={submit}
                  className="mt-7 space-y-6"
                  aria-busy={!!busy}
                >
                  <fieldset
                    disabled={!!busy || uncertain}
                    className="space-y-6"
                  >
                    <legend className="sr-only">
                      Demo appointment request
                    </legend>

                    <TextField
                      label="Selected practice time"
                      value={
                        selectedSlot
                          ? `${formatAppointment(selectedSlot.startAt)} · ${DEMO_TIME_ZONE}`
                          : ""
                      }
                      readOnly
                      required
                      placeholder="Choose a date and time from the calendar"
                      error={formErrors.slot}
                    />

                    {!rescheduling && (
                      <SelectField
                        label="Synthetic identity"
                        value={identity}
                        onChange={(event) => setIdentity(event.target.value)}
                        required
                        error={formErrors.identity}
                      >
                        {DEMO_IDENTITIES.map((value, index) => (
                          <option key={value} value={value}>
                            Synthetic profile {index + 1}
                          </option>
                        ))}
                      </SelectField>
                    )}

                    <CheckboxField
                      label="I understand this is a mock reservation, not a medical appointment."
                      checked={acknowledged}
                      onChange={(event) =>
                        setAcknowledged(event.target.checked)
                      }
                      required
                      error={formErrors.acknowledged}
                    />
                  </fieldset>

                  <Button
                    type="submit"
                    disabled={!!busy || uncertain}
                    loading={busy === "create" || busy === "reschedule"}
                    loadingText="Waiting for backend…"
                  >
                    <CalendarDays size={17} aria-hidden="true" />
                    {rescheduling
                      ? "Request demo reschedule"
                      : "Request demo reservation"}
                  </Button>

                  {rescheduling && (
                    <Button
                      variant="ghost"
                      disabled={!!busy}
                      onClick={() => {
                        setRescheduling(false);
                        setFormErrors({});
                      }}
                    >
                      Keep existing time
                    </Button>
                  )}

                  <p className="type-caption">
                    Selection does not hold a slot. Confirmation appears
                    only after the backend returns the reservation.
                  </p>
                </form>
              </Card>
            ) : (
              <EmptyState
                title={
                  booking?.status === "confirmed"
                    ? "Your demo reservation is shown above."
                    : "Check the saved request first."
                }
                description="You can explore availability without changing a reservation. Use the management actions above to make a change."
              />
            )}
          </div>
        </Container>
      </section>

      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this demo reservation?"
        description="The slot is released only after the backend accepts the cancellation. No real medical appointment is affected."
      >
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setCancelOpen(false)}
          >
            Keep reservation
          </Button>
          <Button onClick={cancelBooking}>Cancel demo reservation</Button>
        </div>
      </Dialog>
    </PracticeLayout>
  );
}