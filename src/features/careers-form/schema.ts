import { z } from "zod";

const optionalUrl = z.union([z.url("Please enter a valid URL"), z.literal("")]).optional();

export const CareersFieldsSchema = z.object({
  firstName: z.string().trim().min(1, "Please enter your first name").max(60),
  lastName: z.string().trim().min(1, "Please enter your last name").max(60),
  email: z.email("Please enter a valid email"),
  phone: z.string().trim().min(5, "Please enter a valid phone number").max(40),
  linkedin: optionalUrl,
  github: optionalUrl,
  experience: z.string().trim().min(1, "Please tell us your experience").max(40),
  expectedSalary: z.string().trim().max(40).optional(),
  position: z.string().trim().min(1).max(120),
  hp_field: z.string().max(500).optional(),
});

export const MAX_RESUME_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB
const OK_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const validateResume = (file: { name: string; size: number; type: string }): string | null => {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (!(ext in OK_TYPES) || (file.type && file.type !== OK_TYPES[ext])) return "Please upload a PDF, DOC or DOCX file.";
  if (file.size > MAX_RESUME_BYTES) return "Your CV must be 4 MB or smaller.";
  if (file.size === 0) return "The selected file is empty.";
  return null;
};
