import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Applied Leverage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "32px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://os.appliedleverage.io/al-logo.png"
          alt="AL"
          width="160"
          height="160"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#e5e5e5",
              letterSpacing: "-0.02em",
            }}
          >
            Applied Leverage
          </div>
          <div style={{ fontSize: 24, color: "#737373" }}>
            AI-Powered Operating System
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
