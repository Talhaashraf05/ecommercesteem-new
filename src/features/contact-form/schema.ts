import { z } from "zod";
import { SERVICE_SLUGS } from "@/content/schemas";

export const ContactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.email("Please enter a valid email"),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(120).optional(),
  service: z.union([z.enum(SERVICE_SLUGS), z.literal("")]).optional(),
  plan: z.string().trim().max(40).optional(),
  budget: z.string().trim().max(40).optional(),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(3000),
  hp_field: z.string().max(500).optional(),
});
export type ContactInput = z.infer<typeof ContactSchema>;
