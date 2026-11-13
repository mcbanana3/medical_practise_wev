import { healthResponseSchema } from "@private-practice/shared";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    const headers = {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    };

    if (url.pathname !== "/api/v1/health") {
      return Response.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "The requested API endpoint does not exist.",
          },
        },
        {
          status: 404,
          headers,
        },
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

    const response = healthResponseSchema.parse({
      status: "ok",
      service: "private-practice-api",
      message: "The local API is connected successfully.",
    });

    return Response.json(response, { headers });
  },
};