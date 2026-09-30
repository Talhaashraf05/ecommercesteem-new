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

export const MAX_RESUME_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB
/** Accepted CV extensions → their canonical MIME type. */
export const OK_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/** Lower-cased extension of a file name ("" when there is none). */
export const resumeExtension = (name: string): string => {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() ?? "") : "";
};

// Browsers without a registered handler send "" (or, once re-parsed from
// multipart on the server, "application/octet-stream") — treat both as "unknown"
// and rely on the extension.
const UNKNOWN_TYPES = new Set(["", "application/octet-stream"]);

export const validateResume = (file: { name: string; size: number; type: string }): string | null => {
  const ext = resumeExtension(file.name);
  if (!Object.hasOwn(OK_TYPES, ext) || (!UNKNOWN_TYPES.has(file.type) && file.type !== OK_TYPES[ext])) return "Please upload a PDF, DOC or DOCX file.";
  if (file.size > MAX_RESUME_BYTES) return "Your CV must be 4 MB or smaller.";
  if (file.size === 0) return "The selected file is empty.";
  return null;
};
