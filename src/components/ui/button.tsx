import Link from "next/link";
import { ArrowIcon } from "./icons";

export type ButtonVariant = "primary" | "secondary" | "ghost";
type Variant = ButtonVariant;
// White text on red must use brand-strong (AA 5.37:1); see globals.css.
const VARIANT: Record<Variant, string> = {
  primary: "bg-brand-strong text-fg hover:bg-brand-strong-hover",
  secondary: "border border-line-strong text-fg hover:bg-surface-raised",
  ghost: "text-fg underline-offset-4 hover:underline",
};
const SIZE = { md: "h-9 px-4 text-sm", lg: "h-11 px-6 text-button" } as const;
export type ButtonSize = keyof typeof SIZE;

/** Shared button look for links, <button>s and form submits. */
export const buttonClasses = (variant: ButtonVariant = "primary", size: ButtonSize = "md"): string =>
  `inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 ${VARIANT[variant]} ${variant === "ghost" ? "" : SIZE[size]}`;

export interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: ButtonSize;
  withArrow?: boolean;
  external?: boolean;
  className?: string;
}

export const ButtonLink = ({ href, children, variant = "primary", size = "md", withArrow, external, className = "" }: ButtonLinkProps) => {
  const cls = `${buttonClasses(variant, size)} ${className}`;
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
