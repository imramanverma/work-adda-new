import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
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
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #047857 100%)",
          borderRadius: "36px",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "20px",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "#f59e0b",
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          WA
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: "#94a3b8",
            marginTop: "8px",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Work Adda
        </div>
      </div>
    ),
    { ...size }
  );
}
