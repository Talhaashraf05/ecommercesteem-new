// CV file checks, zod-free so the client form can import them without pulling
// zod into first-load JS. Re-exported from ./schema for the API route and tests.
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
