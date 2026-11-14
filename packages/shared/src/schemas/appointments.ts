import { z } from "zod";
import {
  DEMO_IDENTITIES,
  DEMO_TIME_ZONE,
} from "../constants/demo-scheduling";

export const demoTokenSchema = z.string().regex(/^[a-f0-9]{64}$/);

export const demoSlotSchema = z.object({
  id: z.string().regex(/^slot-\d{13}$/),
  startAt: z.number().int().positive(),
  endAt: z.number().int().positive(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const demoAvailabilitySchema = z.object({
  demo: z.literal(true),
  timeZone: z.literal(DEMO_TIME_ZONE),
  slots: z.array(demoSlotSchema),
});

export const demoBookingRequestSchema = z
  .object({
    bookingId: z.string().uuid(),
    slotId: demoSlotSchema.shape.id,
    demoIdentity: z.enum(DEMO_IDENTITIES),
    acknowledged: z.literal(true),
  })
  .strict();

export const demoRescheduleSchema = z
  .object({
    slotId: demoSlotSchema.shape.id,
    expectedVersion: z.number().int().positive(),
    acknowledged: z.literal(true),
  })
  .strict();

export const demoCancelSchema = z
  .object({
    expectedVersion: z.number().int().positive(),
  })
  .strict();

export const demoBookingSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["confirmed", "cancelled"]),
  version: z.number().int().positive(),
  demoIdentity: z.enum(DEMO_IDENTITIES),
  slot: demoSlotSchema,
});

export const demoBookingResponseSchema = z.object({
  demo: z.literal(true),
  booking: demoBookingSchema,
});

export const demoSessionSchema = z.object({
  request: demoBookingRequestSchema,
  token: demoTokenSchema,
});

export const demoErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
  }),
});

export type DemoSlot = z.infer<typeof demoSlotSchema>;
export type DemoBooking = z.infer<typeof demoBookingSchema>;
export type DemoSession = z.infer<typeof demoSessionSchema>;
export type DemoBookingResponse = z.infer<
  typeof demoBookingResponseSchema
>;