"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/content/site-basics";
import { withContactEmail } from "@/lib/form-error";
import { createSubmitGuard } from "@/lib/submit-guard";
import { validateResume } from "./resume";

type Status = "idle" | "sending" | "success" | "error";

const FIELD_ORDER = ["firstName", "lastName", "email", "phone", "linkedin", "github", "experience", "expectedSalary", "resume"];
const GENERIC_ERROR = "We couldn't submit your application. Please try again.";

export const CareersForm = ({ position }: { position: string }) => {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [guard] = useState(createSubmitGuard); // sync in-flight flag; `status` lags a render behind

  const onChange = (e: React.FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.name !== "resume") return;
    const file = target.files?.[0];
    const problem = file ? validateResume(file) : null;
    setErrors((prev) => {
      const { resume: _old, ...rest } = prev;
      return problem ? { ...rest, resume: problem } : rest;
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void guard.run(() => submit(e.currentTarget));
  };

  const fail = (message: string) => {
    setServerError(withContactEmail(message, CONTACT_EMAIL));
    setStatus("error");
  };

  const submit = async (form: HTMLFormElement) => {
    const fd = new FormData(form);
    const next: Record<string, string> = {};
    // zod loads on first submit, keeping it out of the page's first-load JS. A failed
    // chunk fetch (offline, deploy skew) surfaces as the usual error with the email fallback.
    let CareersFieldsSchema: typeof import("./schema").CareersFieldsSchema;
    try {
      ({ CareersFieldsSchema } = await import("./schema"));
    } catch {
      fail(GENERIC_ERROR);
      return;
    }
    const parsed = CareersFieldsSchema.safeParse(Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")));
    if (!parsed.success) {
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
    }
    const file = fd.get("resume");
    if (!(file instanceof File) || file.size === 0) next.resume = "Please attach your CV (PDF, DOC or DOCX).";
    else {
      const problem = validateResume(file);
      if (problem) next.resume = problem;
    }
    if (Object.keys(next).length > 0) {
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
      const res = await fetch("/api/careers", { method: "POST", body: fd });
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
        <h2 className="font-display text-display-sm font-semibold leading-title tracking-title text-fg">Thanks — we&apos;ve received your application.</h2>
        <p className="mt-4 text-muted">Our team will review it and get back to you if there&apos;s a fit.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onChange={onChange} noValidate className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-8 sm:p-10">
      <input type="hidden" name="position" value={position} />
      <p className="text-sm text-muted">Applying for: <span className="text-fg">{position}</span></p>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="First name" name="firstName" required autoComplete="given-name" error={errors.firstName} />
        <Field label="Last name" name="lastName" required autoComplete="family-name" error={errors.lastName} />
        <Field label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />
        <Field label="Phone" name="phone" type="tel" required autoComplete="tel" error={errors.phone} />
        <Field label="LinkedIn profile URL" name="linkedin" type="url" error={errors.linkedin} />
        <Field label="GitHub / portfolio URL" name="github" type="url" error={errors.github} />
        <Field label="Years of experience" name="experience" required error={errors.experience} />
        <Field label="Expected salary" name="expectedSalary" error={errors.expectedSalary} />
      </div>
      <Field label="CV (PDF, DOC or DOCX, max 4 MB)" name="resume" type="file" accept=".pdf,.doc,.docx" required error={errors.resume} />
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
        {status === "sending" ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
};
