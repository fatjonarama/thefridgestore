import { ImageResponse } from "next/og";

export const alt = "The Fridge — Cold. Fresh. Yours.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0e12",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="64" height="145" viewBox="0 0 44 100">
            <rect x="2" y="2" width="40" height="96" rx="7" fill="#ff5a1f" />
            <rect x="2" y="34" width="40" height="4" fill="#0a0e12" />
            <rect x="11" y="12" width="4" height="14" rx="1.5" fill="#0a0e12" />
            <rect x="11" y="46" width="4" height="24" rx="1.5" fill="#0a0e12" />
          </svg>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -2,
              color: "#eaf6ff",
            }}
          >
            THE FRIDGE
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#ff5a1f",
          }}
        >
          COLD. FRESH. YOURS.
        </div>
      </div>
    ),
    { ...size },
  );
}
