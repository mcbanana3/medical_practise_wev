import {
  healthResponseSchema,
  reviewsResponseSchema,
} from "@private-practice/shared";
import { handleDemoScheduling } from "./routes/demo/scheduling";
import type { DemoEnvironment } from "./routes/demo/scheduling";

export default {
  async fetch(
    request: Request,
    env: DemoEnvironment,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/v1/demo/")) {
      return handleDemoScheduling(request, env);
    }

    const headers = {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    };

    if (
      !["/api/v1/health", "/api/v1/reviews"].includes(url.pathname)
    ) {
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
          headers: { ...headers, Allow: "GET" },
        },
      );
    }

    if (url.pathname === "/api/v1/reviews") {
      return Response.json(
        reviewsResponseSchema.parse({
          source: "development-placeholder",
          reviews: [],
        }),
        { headers },
      );
    }

    return Response.json(
      healthResponseSchema.parse({
        status: "ok",
        service: "private-practice-api",
        message: "The local API is connected successfully.",
      }),
      { headers },
    );
  },
};