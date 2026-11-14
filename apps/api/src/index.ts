import {
  healthResponseSchema,
  reviewsResponseSchema,
} from "@private-practice/shared";
import type { Env } from "./types/env";
import { ApiError, json } from "./lib/http";
import {
  enforceRateLimits,
  validateConfiguration,
  validateWriteOrigin,
} from "./middleware/security";
import { handleBackendRoutes } from "./routes/backend";
import { handleDemoScheduling } from "./routes/demo/scheduling";

function finalize(response: Response, requestId: string) {
  const headers = new Headers(response.headers);

  headers.set("X-Request-ID", requestId);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");

  if (response.status === 429) {
    headers.set("Retry-After", "60");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      validateConfiguration(request, env);

      const url = new URL(request.url);

      if (
        url.pathname === "/api/v1/health" &&
        request.method === "GET"
      ) {
        return finalize(
          json(
            healthResponseSchema.parse({
              status: "ok",
              service: "private-practice-api",
              message: "The local API is connected successfully.",
            }),
          ),
          requestId,
        );
      }

      await enforceRateLimits(request, env);
      validateWriteOrigin(request, env);

      const backendResponse = await handleBackendRoutes(request, env);

      if (backendResponse) {
        return finalize(backendResponse, requestId);
      }

      if (
        url.pathname === "/api/v1/reviews" &&
        request.method === "GET"
      ) {
        // Preserve the existing public page contract.
        // Synthetic moderation examples are exposed separately.
        return finalize(
          json(
            reviewsResponseSchema.parse({
              source: "development-placeholder",
              reviews: [],
            }),
          ),
          requestId,
        );
      }

      if (
        url.pathname === "/api/v1/availability" &&
        request.method === "GET"
      ) {
        const forwarded = new URL(request.url);
        forwarded.pathname = "/api/v1/demo/slots";

        const response = await handleDemoScheduling(
          new Request(forwarded.toString(), request),
          env,
        );

        return finalize(response, requestId);
      }

      if (url.pathname.startsWith("/api/v1/demo/")) {
        return finalize(
          await handleDemoScheduling(request, env),
          requestId,
        );
      }

      throw new ApiError(
        404,
        "NOT_FOUND",
        "The API endpoint or method is not available.",
      );
    } catch (error) {
      const known = error instanceof ApiError;

      return finalize(
        json(
          {
            error: {
              code: known ? error.code : "INTERNAL_ERROR",
              message: known
                ? error.message
                : "The backend could not complete the request.",
              requestId,
            },
          },
          known ? error.status : 500,
        ),
        requestId,
      );
    }
  },
};