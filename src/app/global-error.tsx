"use client";

import "./globals.css";
import { useEffect } from "react";
import { buttonClasses } from "@/components/ui/button";
import { site } from "@/content/site";

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the
 * layout, so it renders its own <html>/<body> and pulls in the token CSS
 * directly (no header, footer or fonts — keep it dependency-light).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-bg text-fg">
        <main id="main" className="flex min-h-screen flex-col items-center justify-center px-gutter py-24 text-center">
          <p className="font-display text-xl font-semibold text-fg">{site.name}</p>
          <h1 className="mt-8 font-display text-display-sm font-semibold text-fg">Something went wrong</h1>
          <p className="mt-4 text-lead text-muted">An unexpected error occurred. Please try again.</p>
          <button type="button" onClick={reset} className={`mt-10 ${buttonClasses("primary", "md")}`}>
            Try again
          </button>
          <p className="mt-6 text-muted">
            Still stuck?{" "}
            <a href={`mailto:${site.email}`} className="text-fg underline underline-offset-4">
              {site.email}
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
