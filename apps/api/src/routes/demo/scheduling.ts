import {
  DEMO_TIME_ZONE,
  demoBookingRequestSchema,
  demoBookingResponseSchema,
  demoCancelSchema,
  demoAvailabilitySchema,
  demoRescheduleSchema,
  demoTokenSchema,
  practiceDateKey,
  shiftMonth,
} from "@private-practice/shared";

export interface DemoEnvironment {
  DB: D1Database;
  DEMO_MODE: string;
}

type BookingRow = {
  bookingId: string;
  slotId: string;
  originalSlotId: string;
  demoIdentity: string;
  tokenHash: string;
  status: "confirmed" | "cancelled";
  version: number;
  startAt: number;
  endAt: number;
  dateKey: string;
};

type Validator<T> = {
  safeParse: (
    value: unknown,
  ) =>
    | { success: true; data: T }
    | { success: false };
};

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers });
}

async function readBody<T>(
  request: Request,
  schema: Validator<T>,
): Promise<T> {
  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    throw new HttpError(415, "Send an application/json request.");
  }

  const reader = request.body?.getReader();

  if (!reader) {
    throw new HttpError(400, "A request body is required.");
  }

  const chunks: Uint8Array[] = [];
  let length = 0;

  try {
    while (true) {
      const result = await reader.read();

      if (result.done) {
        break;
      }

      length += result.value.byteLength;

      if (length > 2048) {
        await reader.cancel();
        throw new HttpError(413, "The request is too large.");
      }

      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let body: unknown;

  try {
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(400, "The request must contain valid JSON.");
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    throw new HttpError(400, "The submitted demo fields are invalid.");
  }

  return result.data;
}

async function tokenHash(request: Request): Promise<string> {
  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  const parsed = demoTokenSchema.safeParse(token);

  if (!parsed.success) {
    throw new HttpError(401, "A valid demo management token is required.");
  }

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(parsed.data),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function loadBooking(
  db: D1Database,
  bookingId: string,
): Promise<BookingRow | null> {
  return db
    .prepare(
      `SELECT
         b.id AS bookingId,
         b.slot_id AS slotId,
         b.original_slot_id AS originalSlotId,
         b.demo_identity AS demoIdentity,
         b.token_hash AS tokenHash,
         b.status,
         b.version,
         s.start_at AS startAt,
         s.end_at AS endAt,
         s.local_date AS dateKey
       FROM demo_bookings b
       JOIN demo_slots s ON s.id = b.slot_id
       WHERE b.id = ?`,
    )
    .bind(bookingId)
    .first<BookingRow>();
}

function bookingResponse(row: BookingRow, status = 200) {
  return json(
    demoBookingResponseSchema.parse({
      demo: true,
      booking: {
        bookingId: row.bookingId,
        status: row.status,
        version: row.version,
        demoIdentity: row.demoIdentity,
        slot: {
          id: row.slotId,
          startAt: row.startAt,
          endAt: row.endAt,
          dateKey: row.dateKey,
        },
      },
    }),
    status,
  );
}

async function authorizedBooking(
  db: D1Database,
  bookingId: string,
  hash: string,
): Promise<BookingRow> {
  const row = await loadBooking(db, bookingId);

  if (!row || row.tokenHash !== hash) {
    throw new HttpError(404, "No accessible demo reservation was found.");
  }

  return row;
}

function isUniqueConflict(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("UNIQUE constraint failed")
  );
}

export async function handleDemoScheduling(
  request: Request,
  env: DemoEnvironment,
): Promise<Response> {
  try {
    const url = new URL(request.url);

    if (
      env.DEMO_MODE !== "local-only" ||
      !["127.0.0.1", "localhost"].includes(url.hostname)
    ) {
      throw new HttpError(404, "This development endpoint is unavailable.");
    }

    const origin = request.headers.get("Origin");

    if (
      origin &&
      ![
        "http://127.0.0.1:5173",
        "http://localhost:5173",
      ].includes(origin)
    ) {
      throw new HttpError(403, "This origin is not allowed.");
    }

    if (
      request.method !== "GET" &&
      request.headers.get("X-Demo-Client") !== "local-demo"
    ) {
      throw new HttpError(403, "The demo client header is required.");
    }

    if (
      url.pathname === "/api/v1/demo/slots" &&
      request.method === "GET"
    ) {
      const month =
        url.searchParams.get("month") ??
        practiceDateKey(Date.now()).slice(0, 7);

      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        throw new HttpError(400, "Use a month formatted as YYYY-MM.");
      }

      const nextMonth = shiftMonth(month, 1);

      const result = await env.DB.prepare(
        `SELECT
           s.id,
           s.start_at AS startAt,
           s.end_at AS endAt,
           s.local_date AS dateKey
         FROM demo_slots s
         WHERE s.local_date >= ?
           AND s.local_date < ?
           AND s.start_at > ?
           AND s.is_open = 1
           AND NOT EXISTS (
             SELECT 1 FROM demo_bookings b
             WHERE b.slot_id = s.id AND b.status = 'confirmed'
           )
         ORDER BY s.start_at`,
      )
        .bind(`${month}-01`, `${nextMonth}-01`, Date.now())
        .all();

      return json(
        demoAvailabilitySchema.parse({
          demo: true,
          timeZone: DEMO_TIME_ZONE,
          slots: result.results,
        }),
      );
    }

    const hash = await tokenHash(request);

    if (
      url.pathname === "/api/v1/demo/bookings" &&
      request.method === "POST"
    ) {
      const body = await readBody(request, demoBookingRequestSchema);
      const existing = await loadBooking(env.DB, body.bookingId);

      if (existing) {
        if (
          existing.tokenHash === hash &&
          existing.originalSlotId === body.slotId &&
          existing.demoIdentity === body.demoIdentity
        ) {
          return bookingResponse(existing);
        }

        throw new HttpError(409, "The request identifier is already in use.");
      }

      try {
        const result = await env.DB.prepare(
          `INSERT INTO demo_bookings
             (id, slot_id, original_slot_id, demo_identity, token_hash,
              status, version, created_at, updated_at)
           SELECT ?, s.id, s.id, ?, ?, 'confirmed', 1, ?, ?
           FROM demo_slots s
           WHERE s.id = ? AND s.is_open = 1 AND s.start_at > ?`,
        )
          .bind(
            body.bookingId,
            body.demoIdentity,
            hash,
            Date.now(),
            Date.now(),
            body.slotId,
            Date.now(),
          )
          .run();

        if (result.meta.changes !== 1) {
          throw new HttpError(409, "This slot is no longer available.");
        }
      } catch (error) {
        if (!isUniqueConflict(error)) {
          throw error;
        }

        const replay = await loadBooking(env.DB, body.bookingId);

        if (
          replay &&
          replay.tokenHash === hash &&
          replay.originalSlotId === body.slotId &&
          replay.demoIdentity === body.demoIdentity
        ) {
          return bookingResponse(replay);
        }

        throw new HttpError(
          409,
          "Another demo reservation already occupies this slot.",
        );
      }

      const created = await authorizedBooking(env.DB, body.bookingId, hash);
      return bookingResponse(created, 201);
    }

    const match = url.pathname.match(
      /^\/api\/v1\/demo\/bookings\/([^/]+)(?:\/(cancel|reschedule))?$/,
    );

    if (!match) {
      throw new HttpError(404, "The demo endpoint does not exist.");
    }

    const parsedId =
      demoBookingRequestSchema.shape.bookingId.safeParse(match[1]);

    if (!parsedId.success) {
      throw new HttpError(400, "The reservation identifier is invalid.");
    }

    const bookingId = parsedId.data;
    const action = match[2];
    const current = await authorizedBooking(env.DB, bookingId, hash);

    if (!action && request.method === "GET") {
      return bookingResponse(current);
    }

    if (action === "cancel" && request.method === "POST") {
      const body = await readBody(request, demoCancelSchema);

      if (current.status === "cancelled") {
        return bookingResponse(current);
      }

      const result = await env.DB.prepare(
        `UPDATE demo_bookings
         SET status = 'cancelled', version = version + 1, updated_at = ?
         WHERE id = ? AND token_hash = ?
           AND status = 'confirmed' AND version = ?
           AND EXISTS (
             SELECT 1 FROM demo_slots s
             WHERE s.id = demo_bookings.slot_id AND s.start_at > ?
           )`,
      )
        .bind(
          Date.now(),
          bookingId,
          hash,
          body.expectedVersion,
          Date.now(),
        )
        .run();

      if (result.meta.changes !== 1) {
        throw new HttpError(
          409,
          "The reservation changed or has already started. Refresh its status.",
        );
      }

      return bookingResponse(
        await authorizedBooking(env.DB, bookingId, hash),
      );
    }

    if (action === "reschedule" && request.method === "POST") {
      const body = await readBody(request, demoRescheduleSchema);

      if (body.slotId === current.slotId) {
        throw new HttpError(409, "Choose a different available slot.");
      }

      try {
        const result = await env.DB.prepare(
          `UPDATE demo_bookings
           SET slot_id = ?, version = version + 1, updated_at = ?
           WHERE id = ? AND token_hash = ?
             AND status = 'confirmed' AND version = ?
             AND EXISTS (
               SELECT 1 FROM demo_slots old_slot
               WHERE old_slot.id = demo_bookings.slot_id
                 AND old_slot.start_at > ?
             )
             AND EXISTS (
               SELECT 1 FROM demo_slots target
               WHERE target.id = ? AND target.is_open = 1
                 AND target.start_at > ?
             )`,
        )
          .bind(
            body.slotId,
            Date.now(),
            bookingId,
            hash,
            body.expectedVersion,
            Date.now(),
            body.slotId,
            Date.now(),
          )
          .run();

        if (result.meta.changes !== 1) {
          throw new HttpError(
            409,
            "The reservation or target slot changed. Refresh and try again.",
          );
        }
      } catch (error) {
        if (isUniqueConflict(error)) {
          throw new HttpError(
            409,
            "The new slot was taken. Your original reservation was not moved.",
          );
        }

        throw error;
      }

      return bookingResponse(
        await authorizedBooking(env.DB, bookingId, hash),
      );
    }

    throw new HttpError(405, "This operation does not support that method.");
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: { message: error.message } }, error.status);
    }

    return json(
      {
        error: {
          message:
            "The demo backend could not complete the operation. Check local migrations and refresh reservation status before retrying.",
        },
      },
      500,
    );
  }
}