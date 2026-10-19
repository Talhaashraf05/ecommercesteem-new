import type { NextConfig } from "next";

import { redirects } from "./src/lib/redirects";

const nextConfig: NextConfig = {
  // Drop the `X-Powered-By: Next.js` response header.
  poweredByHeader: false,

  // Legacy route redirects (permanent).
  async redirects() {
    return redirects;
  },

  // Baseline security headers on every route. Only frame-ancestors is set in the
  // CSP (clickjacking) — a full script/style CSP would need nonces for next/script.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // Three.js ships its `examples/jsm` add-ons (EffectComposer, UnrealBloomPass…)
  // as untranspiled ESM — transpile them through the Next pipeline.
  transpilePackages: ["three"],

  compiler: {
    // Strip `console.*` from production bundles, keeping error/warn for
    // monitoring. Left on in dev so logs stay available.
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  images: {
    // Modern formats — smaller than JPEG/PNG; the browser picks what it supports.
    formats: ["image/avif", "image/webp"],
    // 75 is the default; 30 is used by the blurred backdrops (portfolio stack).
    qualities: [30, 75],
    // Breakpoints `next/image` uses to build `srcset`. `deviceSizes` covers
    // full-width images (aligned with the adaptive-grid breakpoints + retina);
    // `imageSizes` covers smaller, fixed-width images and icons.
    deviceSizes: [360, 640, 768, 1024, 1280, 1440, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // React Compiler (automatic memoisation) is an opt-in performance win.
  // It requires the `babel-plugin-react-compiler` dev dependency and routes
  // the build through Babel — enable once installed:
  // reactCompiler: true,
};

export default nextConfig;
