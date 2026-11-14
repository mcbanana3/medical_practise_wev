export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type Validator<T> = {
  safeParse: (
    value: unknown,
  ) =>
    | { success: true; data: T }
    | { success: false };
};

export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function readJson<T>(
  request: Request,
  schema: Validator<T>,
): Promise<T> {
  if (
    !request.headers
      .get("Content-Type")
      ?.toLowerCase()
      .includes("application/json")
  ) {
    throw new ApiError(
      415,
      "CONTENT_TYPE",
      "Use application/json.",
    );
  }

  const reader = request.body?.getReader();

  if (!reader) {
    throw new ApiError(400, "MISSING_BODY", "A JSON body is required.");
  }

  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const result = await reader.read();

      if (result.done) {
        break;
      }

      size += result.value.byteLength;

      if (size > 4096) {
        await reader.cancel();
        throw new ApiError(
          413,
          "BODY_TOO_LARGE",
          "The request body is too large.",
        );
      }

      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let data: unknown;

  try {
    data = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Provide valid JSON.");
  }

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "INVALID_INPUT",
      "The submitted fields are invalid or contain unsupported fields.",
    );
  }

  return parsed.data;
}

export function getMonth(url: URL): string {
  const month = url.searchParams.get("month");

  if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new ApiError(
      400,
      "INVALID_MONTH",
      "Provide month=YYYY-MM.",
    );
  }

  return month;
}

export function getPagination(url: URL) {
  const page = Number(url.searchParams.get("page") ?? "1");

  if (!Number.isInteger(page) || page < 1 || page > 1000) {
    throw new ApiError(
      400,
      "INVALID_PAGE",
      "Page must be an integer between 1 and 1000.",
    );
  }

  return {
    page,
    limit: 25,
    offset: (page - 1) * 25,
  };
}