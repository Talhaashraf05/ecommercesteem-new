export interface SectionProps {
  id?: string;
  labelledBy?: string;
  label?: string;
  tone?: "default" | "raised";
  className?: string;
  children: React.ReactNode;
}
export const Section = ({ id, labelledBy, label, tone = "default", className = "", children }: SectionProps) => (
  <section
    id={id}
    aria-labelledby={labelledBy}
    aria-label={labelledBy ? undefined : label}
    className={`px-gutter py-24 md:py-32 ${tone === "raised" ? "bg-surface" : ""} ${className}`}
  >
    {children}
  </section>
);
