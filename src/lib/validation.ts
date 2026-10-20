import { z } from "zod";

export const rsvpSchema = z.object({
  name: z.string().trim().min(1).max(100),
  attending: z.enum(["yes", "no"]),
  guests: z.number().int().min(1).max(10),
  message: z.string().trim().max(500),
});

export type RSVPInput = z.infer<typeof rsvpSchema>;