import { demoErrorResponseSchema } from "@private-practice/shared";

type Parser<T> = {
  parse: (value: unknown) => T;
};

export class DemoApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function demoRequest<T>(
  path: string,
  parser: Parser<T>,
  options: {
    token?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 12000);

  try {
    const headers: Record<string, string> = {
      "X-Demo-Client": "local-demo",
    };

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`/api/v1/demo${path}`, {
      method: options.body === undefined ? "GET" : "POST",
      headers,
      body:
        options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
      signal: controller.signal,
      cache: "no-store",
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      const error = demoErrorResponseSchema.safeParse(data);

      throw new DemoApiError(
        response.status,
        error.success
          ? error.data.error.message
          : `The demo API returned HTTP ${response.status}.`,
      );
    }

    return parser.parse(data);
  } finally {
    window.clearTimeout(timer);
  }
}