// zod/mini: same parse/safeParse/issues API as zod, a fraction of the client bundle.
import * as z from "zod/mini";
import { SERVICE_SLUGS } from "@/content/service-slugs";

const text = (max: number) => z.string().check(z.trim(), z.maxLength(max));

export const ContactSchema = z.object({
  name: z.string().check(z.trim(), z.minLength(1, "Please enter your name"), z.maxLength(100)),
  email: z.email("Please enter a valid email"),
  phone: z.optional(text(40)),
  company: z.optional(text(120)),
  service: z.optional(z.union([z.enum(SERVICE_SLUGS), z.literal("")])),
  plan: z.optional(text(40)),
  budget: z.optional(text(40)),
  message: z.string().check(z.trim(), z.minLength(10, "Tell us a little more (10+ characters)"), z.maxLength(3000)),
  hp_field: z.optional(z.string().check(z.maxLength(500))),
});
export type ContactInput = z.infer<typeof ContactSchema>;
