/**
 * Make sure a form error always gives the visitor a way to reach us: append the
 * contact email unless the message already contains it. Pure and zod-free so it
 * stays out of the way of the client bundle.
 */
export const withContactEmail = (message: string, email: string): string => {
  if (message.includes(email)) return message;
  const trimmed = message.trim();
  if (trimmed.endsWith("Please try again.")) return `${trimmed.slice(0, -1)}, or email us at ${email}.`;
  return `${trimmed.replace(/[.!\s]+$/, "")}. You can also email us at ${email}.`;
};
