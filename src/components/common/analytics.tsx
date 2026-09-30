import Script from "next/script";
import { publicEnv } from "@/env";

/** Env-gated analytics slot. Renders nothing unless NEXT_PUBLIC_GA_ID is set. */
export const Analytics = () => {
  const id = publicEnv.NEXT_PUBLIC_GA_ID;
  if (!id) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
};
