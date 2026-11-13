import { z } from "zod";

export const publicReviewSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  displayName: z.string().min(1),
});

export const reviewsResponseSchema = z.object({
  source: z.literal("development-placeholder"),
  reviews: z.array(publicReviewSchema),
});

export type PublicReview = z.infer<typeof publicReviewSchema>;
export type ReviewsResponse = z.infer<typeof reviewsResponseSchema>;