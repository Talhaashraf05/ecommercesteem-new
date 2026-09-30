import Link from "next/link";
import { ArrowIcon } from "./icons";

type Variant = "primary" | "secondary" | "ghost";
const VARIANT: Record<Variant, string> = {
  primary: "bg-brand text-fg hover:bg-brand-hover",
  secondary: "border border-line-strong text-fg hover:bg-surface-raised",
  ghost: "text-fg underline-offset-4 hover:underline",
};
const SIZE = { md: "h-11 px-5 text-sm", lg: "h-14 px-7 text-button" } as const;

export interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: keyof typeof SIZE;
  withArrow?: boolean;
  external?: boolean;
  className?: string;
}

export const ButtonLink = ({ href, children, variant = "primary", size = "md", withArrow, external, className = "" }: ButtonLinkProps) => {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 ${VARIANT[variant]} ${variant === "ghost" ? "" : SIZE[size]} ${className}`;
  const inner = (
    <>
      {children}
      {withArrow && <ArrowIcon className="size-3.5" aria-hidden="true" />}
    </>
  );
  return external ? (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <Link href={href} className={cls}>{inner}</Link>
  );
};
