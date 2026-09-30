"use client";

import { useEffect } from "react";
import { site } from "@/content/site";
import { buttonClasses } from "@/components/ui/button";

/**
 * Route-segment error boundary. Must be a Client Component. Catches render and
 * data errors in this segment and offers a recovery action via `reset()`.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for logging/monitoring (kept by removeConsole's exclude).
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex min-h-[80vh] flex-col items-center justify-center px-gutter pb-24 pt-40 text-center">
      <h1 className="font-display text-display-sm font-semibold text-fg">Something went wrong</h1>
      <p className="mt-4 text-lead text-muted">An unexpected error occurred. Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className={`mt-10 ${buttonClasses("primary", "md")}`}
      >
        Try again
      </button>
      <p className="mt-6 text-muted">
        Still stuck?{" "}
        <a href={`mailto:${site.email}`} className="text-fg underline underline-offset-4">
          {site.email}
        </a>
      </p>
    </main>
  );
}
