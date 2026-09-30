const W = { page: "max-w-page", title: "max-w-title", lead: "max-w-lead" } as const;
export const Container = ({ width = "page", className = "", children }: { width?: keyof typeof W; className?: string; children: React.ReactNode }) => (
  <div className={`mx-auto w-full ${W[width]} ${className}`}>{children}</div>
);
