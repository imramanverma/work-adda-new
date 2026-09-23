import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a8a, #047857)",
          borderRadius: "8px",
          color: "#f59e0b",
          fontSize: "20px",
          fontWeight: 900,
          fontFamily: "sans-serif",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        W
      </div>
    ),
    { ...size }
  );
}
