"use client";

import { useEffect } from "react";
import { site } from "@/content";

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
        className="mt-10 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-fg transition-colors duration-200 hover:bg-brand-hover"
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
