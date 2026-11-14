import { createRemoteJWKSet, jwtVerify } from "jose";
import type {
  AdminPrincipal,
  AdminRole,
  Env,
} from "../types/env";
import { ApiError } from "../lib/http";

const keySets = new Map<
  string,
  ReturnType<typeof createRemoteJWKSet>
>();

export function isLocalRequest(request: Request) {
  return ["127.0.0.1", "localhost"].includes(
    new URL(request.url).hostname,
  );
}

export function validateConfiguration(
  request: Request,
  env: Env,
) {
  if (env.APP_ENV === "local") {
    if (!isLocalRequest(request)) {
      throw new ApiError(
        503,
        "CONFIGURATION",
        "Local configuration cannot serve this hostname.",
      );
    }

    return;
  }

  if (
    env.APP_ENV !== "production" ||
    env.AUTH_MODE !== "cloudflare-access" ||
    env.DEMO_MODE !== "disabled" ||
    !env.PUBLIC_ORIGIN?.startsWith("https://")
  ) {
    throw new ApiError(
      503,
      "CONFIGURATION",
      "The deployed environment is not configured safely.",
    );
  }
}

export function requireLocalDemo(
  request: Request,
  env: Env,
) {
  if (
    env.APP_ENV !== "local" ||
    env.DEMO_MODE !== "local-only" ||
    !isLocalRequest(request)
  ) {
    throw new ApiError(
      404,
      "NOT_FOUND",
      "This development operation is unavailable.",
    );
  }
}

export function validateWriteOrigin(
  request: Request,
  env: Env,
) {
  if (["GET", "HEAD"].includes(request.method)) {
    return;
  }

  const origin = request.headers.get("Origin");

  // Authenticated command-line clients may omit Origin.
  // Browser writes must come from the configured website.
  if (origin && origin !== env.PUBLIC_ORIGIN) {
    throw new ApiError(
      403,
      "ORIGIN",
      "The request origin is not permitted.",
    );
  }
}

export async function enforceRateLimits(
  request: Request,
  env: Env,
) {
  const key =
    env.APP_ENV === "local"
      ? "local-development"
      : request.headers.get("CF-Connecting-IP");

  if (!key || !env.API_LIMITER || !env.WRITE_LIMITER) {
    throw new ApiError(
      503,
      "RATE_LIMIT_CONFIGURATION",
      "Request protection is unavailable.",
    );
  }

  try {
    const general = await env.API_LIMITER.limit({ key });

    if (!general.success) {
      throw new ApiError(
        429,
        "RATE_LIMITED",
        "Too many requests. Wait before trying again.",
      );
    }

    if (!["GET", "HEAD"].includes(request.method)) {
      const write = await env.WRITE_LIMITER.limit({ key });

      if (!write.success) {
        throw new ApiError(
          429,
          "RATE_LIMITED",
          "Too many write requests. Wait before trying again.",
        );
      }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      503,
      "RATE_LIMIT_UNAVAILABLE",
      "Request protection is temporarily unavailable.",
    );
  }
}

export async function authenticateAdmin(
  request: Request,
  env: Env,
): Promise<AdminPrincipal> {
  let subject: string;

  if (env.AUTH_MODE === "local-token") {
    requireLocalDemo(request, env);

    const configured = env.LOCAL_ADMIN_TOKEN ?? "";
    const authorization = request.headers.get("Authorization") ?? "";

    if (!/^[a-f0-9]{64}$/.test(configured)) {
      throw new ApiError(
        503,
        "AUTH_CONFIGURATION",
        "Local administrator authentication is not configured.",
      );
    }

    if (authorization !== `Bearer ${configured}`) {
      throw new ApiError(
        401,
        "UNAUTHENTICATED",
        "Administrator authentication is required.",
      );
    }

    subject = "local-development-owner";
  } else if (env.AUTH_MODE === "cloudflare-access") {
    let issuer: URL;

    try {
      issuer = new URL(env.ACCESS_ISSUER);
    } catch {
      throw new ApiError(
        503,
        "AUTH_CONFIGURATION",
        "Access authentication is not configured.",
      );
    }

    if (
      issuer.protocol !== "https:" ||
      !issuer.hostname.endsWith(".cloudflareaccess.com") ||
      issuer.origin !== env.ACCESS_ISSUER ||
      !env.ACCESS_AUDIENCE
    ) {
      throw new ApiError(
        503,
        "AUTH_CONFIGURATION",
        "Access authentication settings are invalid.",
      );
    }

    const token = request.headers.get("Cf-Access-Jwt-Assertion");

    if (!token) {
      throw new ApiError(
        401,
        "UNAUTHENTICATED",
        "Cloudflare Access authentication is required.",
      );
    }

    let keys = keySets.get(issuer.origin);

    if (!keys) {
      keys = createRemoteJWKSet(
        new URL("/cdn-cgi/access/certs", issuer),
      );
      keySets.set(issuer.origin, keys);
    }

    try {
      const result = await jwtVerify(token, keys, {
        issuer: issuer.origin,
        audience: env.ACCESS_AUDIENCE,
        algorithms: ["RS256"],
        requiredClaims: ["sub", "exp", "iat"],
        clockTolerance: 5,
      });

      if (!result.payload.sub) {
        throw new Error("Missing subject.");
      }

      subject = result.payload.sub;
    } catch {
      throw new ApiError(
        401,
        "INVALID_ACCESS_TOKEN",
        "The Access assertion could not be verified.",
      );
    }
  } else {
    throw new ApiError(
      503,
      "AUTH_CONFIGURATION",
      "No supported authentication mode is configured.",
    );
  }

  const principal = await env.DB.prepare(
    `SELECT subject, role
     FROM admin_principals
     WHERE subject = ? AND active = 1`,
  )
    .bind(subject)
    .first<AdminPrincipal>();

  if (!principal) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "This identity has no active administrator role.",
    );
  }

  return principal;
}

export function requireRole(
  principal: AdminPrincipal,
  roles: AdminRole[],
) {
  if (principal.role !== "owner" && !roles.includes(principal.role)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Your role cannot perform this operation.",
    );
  }
}