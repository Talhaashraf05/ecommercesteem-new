// zod/mini: same parse/safeParse/issues API as zod, a fraction of the client bundle.
import * as z from "zod/mini";

const optionalUrl = z.optional(z.union([z.url("Please enter a valid URL"), z.literal("")]));
const required = (max: number, message?: string) =>
  z.string().check(z.trim(), z.minLength(1, message), z.maxLength(max));

export const CareersFieldsSchema = z.object({
  firstName: required(60, "Please enter your first name"),
  lastName: required(60, "Please enter your last name"),
  email: z.email("Please enter a valid email"),
  phone: z.string().check(z.trim(), z.minLength(5, "Please enter a valid phone number"), z.maxLength(40)),
  linkedin: optionalUrl,
  github: optionalUrl,
  experience: required(40, "Please tell us your experience"),
  expectedSalary: z.optional(z.string().check(z.trim(), z.maxLength(40))),
  position: required(120),
  hp_field: z.optional(z.string().check(z.maxLength(500))),
});

export { MAX_RESUME_BYTES, OK_TYPES, resumeExtension, validateResume } from "./resume";
