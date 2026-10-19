import { ImageResponse } from "next/og";

export const alt = "EcommerceSteem — Amazon growth, done right";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          color: "#F5F5F7",
          backgroundColor: "#07070A",
          backgroundImage: "radial-gradient(circle at 80% 100%, rgba(220,51,38,0.55) 0%, rgba(255,90,60,0.18) 35%, rgba(7,7,10,0) 70%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 112, fontWeight: 700, letterSpacing: -3 }}>
          <span>Ecommerce</span>
          <span style={{ color: "#DC3326" }}>Steem</span>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 40, color: "#9A9AA5" }}>
          Amazon growth, done right
        </div>
      </div>
    ),
    size,
  );
}
