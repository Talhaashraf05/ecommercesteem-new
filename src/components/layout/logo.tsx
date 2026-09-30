import Image from "next/image";
import Link from "next/link";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link
    href="/"
    aria-label="EcommerceSteem home"
    className={`inline-flex items-center rounded-md ${className}`}
  >
    <Image
      src="/brand/logo-white.png"
      alt="EcommerceSteem"
      width={698}
      height={458}
      priority
      className="h-10 w-auto"
    />
  </Link>
);
