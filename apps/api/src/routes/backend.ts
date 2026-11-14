import {
  DEMO_SLOT_MINUTES,
  DEMO_TIME_ZONE,
  addCalendarDays,
  availabilityGenerationSchema,
  contentKeySchema,
  contentUpdateSchema,
  demoReviewSubmissionSchema,
  demoSlotSchema,
  localPracticeTimeToUtc,
  practiceDateKey,
  reviewModerationSchema,
  reviewStatusSchema,
  shiftMonth,
  slotUpdateSchema,
} from "@private-practice/shared";
import type {
  AdminPrincipal,
  Env,
} from "../types/env";
import {
  ApiError,
  getMonth,
  getPagination,
  json,
  readJson,
} from "../lib/http";
import {
  contentFixtures,
  reviewFixtures,
} from "../lib/fixtures";
import {
  authenticateAdmin,
  requireLocalDemo,
  requireRole,
} from "../middleware/security";

type ContentRow = {
  key: keyof typeof contentFixtures extends never ? never : string;
  fixtureId: keyof typeof contentFixtures;
  published: number;
  version: number;
};

type ReviewRow = {
  id: string;
  fixtureId: keyof typeof reviewFixtures;
  status: "pending" | "approved" | "rejected" | "unpublished";
  version: number;
  createdAt: number;
};

async function auditedMutation(
  env: Env,
  statement: D1PreparedStatement,
  principal: AdminPrincipal,
  action: string,
  reference: string,
) {
  // D1 runs this batch transactionally. The audit insert is conditional
  // on the immediately preceding mutation changing one row.
  const results = await env.DB.batch([
    statement,
    env.DB.prepare(
      `INSERT INTO admin_audit_events
         (id, actor_subject, actor_role, action,
          entity_reference, created_at)
       SELECT ?, ?, ?, ?, ?, ?
       WHERE changes() = 1`,
    ).bind(
      crypto.randomUUID(),
      principal.subject,
      principal.role,
      action,
      reference,
      Date.now(),
    ),
  ]);

  if (results[0].meta.changes !== 1) {
    throw new ApiError(
      409,
      "CONFLICT",
      "The record changed or the operation is not permitted in its current state.",
    );
  }
}

function presentContent(row: ContentRow) {
  const fixture = contentFixtures[row.fixtureId];

  if (!fixture || fixture.key !== row.key) {
    throw new ApiError(
      500,
      "CONTENT_CONFIGURATION",
      "A content fixture is configured incorrectly.",
    );
  }

  return {
    key: row.key,
    fixtureId: row.fixtureId,
    title: fixture.title,
    body: fixture.body,
    isPlaceholder: true,
    published: row.published === 1,
    version: row.version,
  };
}

function presentReview(row: ReviewRow) {
  const fixture = reviewFixtures[row.fixtureId];

  if (!fixture) {
    throw new ApiError(
      500,
      "REVIEW_CONFIGURATION",
      "A review fixture is configured incorrectly.",
    );
  }

  return {
    ...row,
    ...fixture,
    isDemo: true,
  };
}

export async function handleBackendRoutes(
  request: Request,
  env: Env,
): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/v1/content" && request.method === "GET") {
    const rows = await env.DB.prepare(
      `SELECT
         content_key AS key,
         fixture_id AS fixtureId,
         published,
         version
       FROM website_content
       WHERE published = 1
       ORDER BY content_key`,
    ).all<ContentRow>();

    return json({
      source: "development-placeholder",
      content: rows.results.map(presentContent),
    });
  }

  if (path === "/api/v1/demo/reviews") {
    requireLocalDemo(request, env);

    if (request.method === "GET") {
      const rows = await env.DB.prepare(
        `SELECT
           id,
           fixture_id AS fixtureId,
           status,
           version,
           created_at AS createdAt
         FROM demo_reviews
         WHERE status = 'approved'
         ORDER BY created_at DESC
         LIMIT 25`,
      ).all<ReviewRow>();

      return json({
        demo: true,
        reviews: rows.results.map(presentReview),
      });
    }

    if (request.method === "POST") {
      if (request.headers.get("X-Demo-Client") !== "local-demo") {
        throw new ApiError(
          403,
          "DEMO_HEADER",
          "The demo client header is required.",
        );
      }

      const body = await readJson(
        request,
        demoReviewSubmissionSchema,
      );

      const result = await env.DB.prepare(
        `INSERT INTO demo_reviews
           (id, fixture_id, status, version, created_at, updated_at)
         VALUES (?, ?, 'pending', 1, ?, ?)
         ON CONFLICT(id) DO NOTHING`,
      )
        .bind(
          body.submissionId,
          body.fixtureId,
          Date.now(),
          Date.now(),
        )
        .run();

      const row = await env.DB.prepare(
        `SELECT
           id,
           fixture_id AS fixtureId,
           status,
           version,
           created_at AS createdAt
         FROM demo_reviews WHERE id = ?`,
      )
        .bind(body.submissionId)
        .first<ReviewRow>();

      if (!row || row.fixtureId !== body.fixtureId) {
        throw new ApiError(
          409,
          "CONFLICT",
          "The submission identifier is already in use.",
        );
      }

      return json(
        { demo: true, review: presentReview(row) },
        result.meta.changes === 1 ? 201 : 200,
      );
    }

    throw new ApiError(405, "METHOD", "Use GET or POST.");
  }

  if (!path.startsWith("/api/v1/admin/")) {
    return null;
  }

  const principal = await authenticateAdmin(request, env);

  if (path === "/api/v1/admin/session" && request.method === "GET") {
    return json({ principal });
  }

  if (path === "/api/v1/admin/content" && request.method === "GET") {
    requireRole(principal, []);

    const rows = await env.DB.prepare(
      `SELECT
         content_key AS key,
         fixture_id AS fixtureId,
         published,
         version
       FROM website_content ORDER BY content_key`,
    ).all<ContentRow>();

    return json({
      content: rows.results.map(presentContent),
    });
  }

  const contentMatch = path.match(
    /^\/api\/v1\/admin\/content\/([^/]+)$/,
  );

  if (contentMatch && request.method === "PUT") {
    requireRole(principal, []);

    const key = contentKeySchema.safeParse(contentMatch[1]);

    if (!key.success) {
      throw new ApiError(400, "INVALID_KEY", "Unknown content key.");
    }

    const body = await readJson(request, contentUpdateSchema);

    if (contentFixtures[body.fixtureId].key !== key.data) {
      throw new ApiError(
        400,
        "INVALID_FIXTURE",
        "The fixture does not belong to this content section.",
      );
    }

    await auditedMutation(
      env,
      env.DB.prepare(
        `UPDATE website_content
         SET fixture_id = ?, published = ?,
             version = version + 1, updated_at = ?
         WHERE content_key = ? AND version = ?`,
      ).bind(
        body.fixtureId,
        body.published ? 1 : 0,
        Date.now(),
        key.data,
        body.expectedVersion,
      ),
      principal,
      "content.updated",
      key.data,
    );

    return json({ updated: true });
  }

  if (
    path === "/api/v1/admin/audit-events" &&
    request.method === "GET"
  ) {
    requireRole(principal, []);
    const pagination = getPagination(url);

    const rows = await env.DB.prepare(
      `SELECT
         id,
         actor_subject AS actorSubject,
         actor_role AS actorRole,
         action,
         entity_reference AS entityReference,
         created_at AS createdAt
       FROM admin_audit_events
       ORDER BY created_at DESC, id
       LIMIT ? OFFSET ?`,
    )
      .bind(pagination.limit, pagination.offset)
      .all();

    return json({
      page: pagination.page,
      events: rows.results,
    });
  }

  // Everything below manages synthetic scheduling/review records.
  requireLocalDemo(request, env);

  if (
    path === "/api/v1/admin/demo-bookings" &&
    request.method === "GET"
  ) {
    requireRole(principal, ["scheduler"]);
    const pagination = getPagination(url);

    const rows = await env.DB.prepare(
      `SELECT
         b.id,
         b.demo_identity AS demoIdentity,
         b.status,
         b.version,
         s.start_at AS startAt,
         s.end_at AS endAt,
         s.local_date AS dateKey
       FROM demo_bookings b
       JOIN demo_slots s ON s.id = b.slot_id
       ORDER BY b.created_at DESC, b.id
       LIMIT ? OFFSET ?`,
    )
      .bind(pagination.limit, pagination.offset)
      .all();

    return json({
      demo: true,
      page: pagination.page,
      bookings: rows.results,
    });
  }

  if (
    path === "/api/v1/admin/availability" &&
    request.method === "GET"
  ) {
    requireRole(principal, ["scheduler"]);
    const month = getMonth(url);

    const rows = await env.DB.prepare(
      `SELECT
         s.id,
         s.start_at AS startAt,
         s.end_at AS endAt,
         s.local_date AS dateKey,
         s.is_open AS isOpen,
         s.version,
         EXISTS (
           SELECT 1 FROM demo_bookings b
           WHERE b.slot_id = s.id AND b.status = 'confirmed'
         ) AS reserved
       FROM demo_slots s
       WHERE s.local_date >= ? AND s.local_date < ?
       ORDER BY s.start_at`,
    )
      .bind(`${month}-01`, `${shiftMonth(month, 1)}-01`)
      .all();

    return json({
      demo: true,
      timeZone: DEMO_TIME_ZONE,
      slots: rows.results,
    });
  }

  if (
    path === "/api/v1/admin/availability/generate" &&
    request.method === "POST"
  ) {
    requireRole(principal, ["scheduler"]);

    const body = await readJson(
      request,
      availabilityGenerationSchema,
    );

    const today = practiceDateKey(Date.now());
    const statements: D1PreparedStatement[] = [];

    for (let day = 0; day <= body.horizonDays; day += 1) {
      const dateKey = addCalendarDays(today, day);
      const weekday = new Date(`${dateKey}T12:00:00Z`).getUTCDay();

      if (weekday === 0 || weekday === 6) {
        continue;
      }

      for (let minute = 9 * 60; minute < 17 * 60; minute += 30) {
        const startAt = localPracticeTimeToUtc(
          dateKey,
          Math.floor(minute / 60),
          minute % 60,
        );

        if (startAt <= Date.now()) {
          continue;
        }

        statements.push(
          env.DB.prepare(
            `INSERT OR IGNORE INTO demo_slots
               (id, start_at, end_at, local_date, is_open)
             VALUES (?, ?, ?, ?, 1)`,
          ).bind(
            `slot-${startAt}`,
            startAt,
            startAt + DEMO_SLOT_MINUTES * 60_000,
            dateKey,
          ),
        );
      }
    }

    let inserted = 0;

    // Each chunk is atomic; generation as a whole is rerunnable.
    // Existing reservations and blocked slots are preserved.
    for (let offset = 0; offset < statements.length; offset += 50) {
      const results = await env.DB.batch(
        statements.slice(offset, offset + 50),
      );

      inserted += results.reduce(
        (total, result) => total + result.meta.changes,
        0,
      );
    }

    await env.DB.prepare(
      `INSERT INTO admin_audit_events
         (id, actor_subject, actor_role, action,
          entity_reference, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        principal.subject,
        principal.role,
        "availability.generated",
        `synthetic-horizon-${body.horizonDays}`,
        Date.now(),
      )
      .run();

    return json({
      demo: true,
      inserted,
      timeZone: DEMO_TIME_ZONE,
      note: "Synthetic weekdays, 9am–5pm; fixed 30-minute slots.",
    });
  }

  const slotMatch = path.match(
    /^\/api\/v1\/admin\/slots\/([^/]+)$/,
  );

  if (slotMatch && request.method === "PATCH") {
    requireRole(principal, ["scheduler"]);

    const slotId = demoSlotSchema.shape.id.safeParse(slotMatch[1]);

    if (!slotId.success) {
      throw new ApiError(400, "INVALID_SLOT", "Invalid slot identifier.");
    }

    const body = await readJson(request, slotUpdateSchema);

    await auditedMutation(
      env,
      env.DB.prepare(
        `UPDATE demo_slots
         SET is_open = ?, version = version + 1
         WHERE id = ? AND version = ? AND start_at > ?
           AND (
             ? = 1 OR NOT EXISTS (
               SELECT 1 FROM demo_bookings b
               WHERE b.slot_id = demo_slots.id
                 AND b.status = 'confirmed'
             )
           )`,
      ).bind(
        body.open ? 1 : 0,
        slotId.data,
        body.expectedVersion,
        Date.now(),
        body.open ? 1 : 0,
      ),
      principal,
      "availability.slot-updated",
      slotId.data,
    );

    return json({ demo: true, updated: true });
  }

  if (
    path === "/api/v1/admin/demo-reviews" &&
    request.method === "GET"
  ) {
    requireRole(principal, ["moderator"]);

    const filter = url.searchParams.get("status") ?? "pending";

    if (
      filter !== "all" &&
      !reviewStatusSchema.safeParse(filter).success
    ) {
      throw new ApiError(400, "INVALID_STATUS", "Unknown review status.");
    }

    const pagination = getPagination(url);

    const rows = await env.DB.prepare(
      `SELECT
         id,
         fixture_id AS fixtureId,
         status,
         version,
         created_at AS createdAt
       FROM demo_reviews
       WHERE (? = 'all' OR status = ?)
       ORDER BY created_at DESC, id
       LIMIT ? OFFSET ?`,
    )
      .bind(
        filter,
        filter,
        pagination.limit,
        pagination.offset,
      )
      .all<ReviewRow>();

    return json({
      demo: true,
      page: pagination.page,
      reviews: rows.results.map(presentReview),
    });
  }

  const reviewMatch = path.match(
    /^\/api\/v1\/admin\/demo-reviews\/([^/]+)\/moderate$/,
  );

  if (reviewMatch && request.method === "POST") {
    requireRole(principal, ["moderator"]);

    const id = demoReviewSubmissionSchema.shape.submissionId.safeParse(
      reviewMatch[1],
    );

    if (!id.success) {
      throw new ApiError(400, "INVALID_ID", "Invalid review identifier.");
    }

    const body = await readJson(request, reviewModerationSchema);

    const row = await env.DB.prepare(
      `SELECT status FROM demo_reviews WHERE id = ?`,
    )
      .bind(id.data)
      .first<{ status: ReviewRow["status"] }>();

    if (!row) {
      throw new ApiError(404, "NOT_FOUND", "The demo review was not found.");
    }

    const transitions: Record<ReviewRow["status"], string[]> = {
      pending: ["approved", "rejected"],
      approved: ["unpublished"],
      rejected: ["pending"],
      unpublished: ["pending"],
    };

    if (!transitions[row.status].includes(body.status)) {
      throw new ApiError(
        409,
        "INVALID_TRANSITION",
        "That moderation transition is not allowed.",
      );
    }

    await auditedMutation(
      env,
      env.DB.prepare(
        `UPDATE demo_reviews
         SET status = ?, version = version + 1,
             moderated_by = ?, updated_at = ?
         WHERE id = ? AND version = ? AND status = ?`,
      ).bind(
        body.status,
        principal.subject,
        Date.now(),
        id.data,
        body.expectedVersion,
        row.status,
      ),
      principal,
      "review.moderated",
      id.data,
    );

    return json({
      demo: true,
      updated: true,
      status: body.status,
    });
  }

  throw new ApiError(
    404,
    "NOT_FOUND",
    "The administrator endpoint or method is not available.",
  );
}