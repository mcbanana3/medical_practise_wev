import { z } from "zod";

export const contentKeySchema = z.enum([
  "hero",
  "doctor",
  "contact",
]);

export const contentFixtureIdSchema = z.enum([
  "hero-placeholder",
  "doctor-placeholder",
  "contact-placeholder",
]);

export const contentUpdateSchema = z
  .object({
    fixtureId: contentFixtureIdSchema,
    published: z.boolean(),
    expectedVersion: z.number().int().positive(),
  })
  .strict();

export const demoReviewFixtureSchema = z.enum([
  "review-layout-a",
  "review-layout-b",
]);

export const demoReviewSubmissionSchema = z
  .object({
    submissionId: z.string().uuid(),
    fixtureId: demoReviewFixtureSchema,
    acknowledged: z.literal(true),
  })
  .strict();

export const reviewStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "unpublished",
]);

export const reviewModerationSchema = z
  .object({
    status: reviewStatusSchema,
    expectedVersion: z.number().int().positive(),
  })
  .strict();

export const slotUpdateSchema = z
  .object({
    open: z.boolean(),
    expectedVersion: z.number().int().positive(),
  })
  .strict();

export const availabilityGenerationSchema = z
  .object({
    horizonDays: z.number().int().min(1).max(60),
  })
  .strict();