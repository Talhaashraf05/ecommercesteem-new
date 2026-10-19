import Image from "next/image";
import Link from "next/link";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link
    href="/"
    aria-label="EcommerceSteem home"
    className={`inline-flex items-center rounded-md ${className}`}
  >
    <Image
      src="/brand/logo-lockup-white.png"
      alt="EcommerceSteem"
      width={1566}
      height={240}
      priority
      sizes="14rem"
      className="h-5 w-auto sm:h-6"
    />
  </Link>
);
