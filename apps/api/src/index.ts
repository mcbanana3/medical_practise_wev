import {
  healthResponseSchema,
  reviewsResponseSchema,
} from "@private-practice/shared";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    const headers = {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    };

    const knownPaths = [
      "/api/v1/health",
      "/api/v1/reviews",
    ];

    if (!knownPaths.includes(url.pathname)) {
      return Response.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "The requested API endpoint does not exist.",
          },
        },
        { status: 404, headers },
      );
    }

    if (request.method !== "GET") {
      return Response.json(
        {
          error: {
            code: "METHOD_NOT_ALLOWED",
            message: "This endpoint only accepts GET requests.",
          },
        },
        {
          status: 405,
          headers: {
            ...headers,
            Allow: "GET",
          },
        },
      );
    }

    if (url.pathname === "/api/v1/reviews") {
      // No review database is connected in this phase.
      // An empty list is intentional; no reviews are fabricated.
      const response = reviewsResponseSchema.parse({
        source: "development-placeholder",
        reviews: [],
      });

      return Response.json(response, { headers });
    }

    const response = healthResponseSchema.parse({
      status: "ok",
      service: "private-practice-api",
      message: "The local API is connected successfully.",
    });

    return Response.json(response, { headers });
  },
};