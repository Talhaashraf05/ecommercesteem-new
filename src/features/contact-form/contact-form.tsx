"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { services } from "@/content";
import { SERVICE_SLUGS } from "@/content/schemas";
import { Field } from "@/components/ui/field";
import { ContactSchema } from "./schema";

type Status = "idle" | "sending" | "success" | "error";

const BUDGETS = ["Under $1k/mo", "$1k–5k/mo", "$5k–20k/mo", "$20k+/mo"].map((b) => ({ value: b, label: b }));
const SERVICE_OPTIONS = services.map((s) => ({ value: s.slug, label: s.name }));
const FIELD_ORDER = ["name", "email", "phone", "company", "service", "budget", "message"];
const GENERIC_ERROR = "We couldn't send your message. Please try again.";

export const ContactForm = () => {
  const params = useSearchParams();
  const serviceParam = params.get("service") ?? "";
  const service = (SERVICE_SLUGS as readonly string[]).includes(serviceParam) ? serviceParam : "";
  const plan = (params.get("plan") ?? "").slice(0, 40);

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
      setServerError(json?.error?.message ?? GENERIC_ERROR);
    } catch {
      setServerError(GENERIC_ERROR);
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
        <Field label="Service" name="service" as="select" options={SERVICE_OPTIONS} defaultValue={service} error={errors.service} />
        <Field label="Monthly budget" name="budget" as="select" options={BUDGETS} error={errors.budget} />
      </div>
      {plan && (
        <>
          <input type="hidden" name="plan" value={plan} />
          <p className="text-sm text-muted">Plan: <span className="text-fg">{plan}</span></p>
        </>
      )}
      <Field label="Message" name="message" as="textarea" required error={errors.message} />
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="f-website">Website</label>
        <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {status === "error" && (
        <p role="alert" className="rounded-xl border border-brand bg-surface-raised px-4 py-3 text-sm text-brand-glow">
          {serverError}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-14 items-center justify-center rounded-full bg-brand px-7 text-button font-medium text-fg transition-colors duration-200 hover:bg-brand-hover disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
};
