import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Builder Maps - Where builders hang out";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d0d0d",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a1a 0%, transparent 50%), radial-gradient(circle at 75% 75%, #1a1a1a 0%, transparent 50%)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 32 32"
            style={{ marginRight: 20 }}
          >
            <rect width="32" height="32" rx="6" fill="#1a1a1a" />
            <circle cx="16" cy="13" r="5" fill="#c8ff00" />
            <path
              d="M8 22 Q16 16 24 22"
              stroke="#c8ff00"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="10" cy="19" r="1.5" fill="#c8ff00" opacity="0.6" />
            <circle cx="22" cy="19" r="1.5" fill="#c8ff00" opacity="0.6" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#fafafa",
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          Builder Maps
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#c8ff00",
            marginBottom: 48,
          }}
        >
          Where builders hang out
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 700, color: "#fafafa" }}>
              40+
            </div>
            <div style={{ fontSize: 20, color: "#71717a" }}>Cities</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 700, color: "#fafafa" }}>
              180+
            </div>
            <div style={{ fontSize: 20, color: "#71717a" }}>Spots</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 700, color: "#fafafa" }}>
              5
            </div>
            <div style={{ fontSize: 20, color: "#71717a" }}>Regions</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
