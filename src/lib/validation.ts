import { z } from "zod";

import { CATEGORIES, MAX_IMAGES } from "@/lib/constants";

export const incidentSchema = z.object({
  title: z.string().trim().min(4, "Use at least 4 characters.").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Describe what happened in at least 10 characters.")
    .max(2000),
  category: z.enum(CATEGORIES),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().trim().max(300).nullable(),
  images: z.array(z.string()).max(MAX_IMAGES),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});
export const registerSchema = loginSchema.extend({
  fullName: z.string().trim().min(2).max(80),
});
export type IncidentFormValues = z.infer<typeof incidentSchema>;
