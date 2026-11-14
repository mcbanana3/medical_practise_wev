import type { DemoEnvironment } from "../routes/demo/scheduling";

type RateLimiterBinding = {
  limit: (options: {
    key: string;
  }) => Promise<{ success: boolean }>;
};

export interface Env extends DemoEnvironment {
  APP_ENV: string;
  AUTH_MODE: string;
  PUBLIC_ORIGIN: string;
  ACCESS_ISSUER: string;
  ACCESS_AUDIENCE: string;
  LOCAL_ADMIN_TOKEN?: string;
  API_LIMITER: RateLimiterBinding;
  WRITE_LIMITER: RateLimiterBinding;
}

export type AdminRole = "owner" | "scheduler" | "moderator";

export type AdminPrincipal = {
  subject: string;
  role: AdminRole;
};