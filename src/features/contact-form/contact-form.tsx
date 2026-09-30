"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SERVICE_SLUGS } from "@/content/service-slugs";
import { Field } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/content/site-basics";
import { withContactEmail } from "@/lib/form-error";
import { ContactSchema } from "./schema";

type Status = "idle" | "sending" | "success" | "error";

const BUDGETS = ["Under $1k/mo", "$1k–5k/mo", "$5k–20k/mo", "$20k+/mo"].map((b) => ({ value: b, label: b }));
const FIELD_ORDER = ["name", "email", "phone", "company", "service", "budget", "message"];
const GENERIC_ERROR = "We couldn't send your message. Please try again.";

type Option = { value: string; label: string };

type ContactFormProps = { serviceOptions: Option[]; service?: string; plan?: string };

/**
 * Reads `?service=` / `?plan=` and prefills the form. Render inside <Suspense>
 * with a plain <ContactForm> as the fallback, so the prerendered HTML already
 * contains the full form (no layout shift when the params resolve).
 */
export const ContactFormFromParams = ({ serviceOptions }: { serviceOptions: Option[] }) => {
  const params = useSearchParams();
  const serviceParam = params.get("service") ?? "";
  const service = (SERVICE_SLUGS as readonly string[]).includes(serviceParam) ? serviceParam : "";
  const plan = (params.get("plan") ?? "").slice(0, 40);
  return <ContactForm serviceOptions={serviceOptions} service={service} plan={plan} />;
};

export const ContactForm = ({ serviceOptions, service = "", plan = "" }: ContactFormProps) => {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = ContactSchema.safeParse(raw);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        next[key] ??= issue.message;
      }
      setErrors(next);
      setServerError("");
      const first = FIELD_ORDER.find((k) => next[k]);
      if (first) document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setErrors({});
    setServerError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        setStatus("success");
        return;
      }
      const json = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      setServerError(withContactEmail(json?.error?.message ?? GENERIC_ERROR, CONTACT_EMAIL));
    } catch {
      setServerError(withContactEmail(GENERIC_ERROR, CONTACT_EMAIL));
    }
    setStatus("error");
  };

  if (status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-line bg-surface p-8 sm:p-10">
        <h2 className="font-display text-display-sm text-fg">Thanks — we&apos;ll reply within one business day.</h2>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-8 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" name="name" required autoComplete="name" error={errors.name} />
        <Field label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
        <Field label="Company" name="company" autoComplete="organization" error={errors.company} />
        <Field label="Service" name="service" as="select" options={serviceOptions} defaultValue={service} error={errors.service} />
        <Field label="Monthly budget" name="budget" as="select" options={BUDGETS} error={errors.budget} />
      </div>
      {plan && (
        <>
          <input type="hidden" name="plan" value={plan} />
          <p className="text-sm text-muted">Plan: <span className="text-fg">{plan}</span></p>
        </>
      )}
      <Field label="Message" name="message" as="textarea" required error={errors.message} />
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="f-hp_field">Leave this field empty</label>
        <input id="f-hp_field" name="hp_field" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {status === "error" && (
        <p role="alert" className="rounded-xl border border-brand bg-surface-raised px-4 py-3 text-sm text-brand-glow">
          {serverError}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className={`${buttonClasses("primary", "lg")} disabled:opacity-60`}
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
};
