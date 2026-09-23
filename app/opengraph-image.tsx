import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #090d16 0%, #172554 50%, #064e3b 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Top Header Tagline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 22px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              fontSize: "20px",
              fontWeight: 800,
              color: "#38bdf8",
              letterSpacing: "0.5px",
            }}
          >
            <span>📍 Active in Fatehabad, Sirsa & Hisar, Haryana</span>
          </div>
          <div
            style={{
              padding: "10px 22px",
              borderRadius: "999px",
              background: "#10b981",
              color: "#022c22",
              fontSize: "20px",
              fontWeight: 900,
            }}
          >
            ₹0 Platform Fee
          </div>
        </div>

        {/* Center Title & Slogan */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontSize: "88px",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-2px",
              }}
            >
              Work
            </span>
            <span
              style={{
                fontSize: "88px",
                fontWeight: 900,
                color: "#f59e0b",
                letterSpacing: "-2px",
              }}
            >
              Adda
            </span>
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#e2e8f0",
              letterSpacing: "-0.5px",
            }}
          >
            “Local Work. Local People. Local Growth.”
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              maxWidth: "900px",
              lineHeight: 1.4,
            }}
          >
            Hyperlocal marketplace connecting students, skilled workers, and neighborhood businesses. 100% Escrow Protected with Instant UPI Payouts.
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "20px",
              fontWeight: 700,
              color: "#cbd5e1",
            }}
          >
            📚 Academic & Assignment Work
          </div>
          <div style={{ color: "#64748b", fontSize: "20px" }}>•</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "20px",
              fontWeight: 700,
              color: "#cbd5e1",
            }}
          >
            🏪 Local Retail & Store Help
          </div>
          <div style={{ color: "#64748b", fontSize: "20px" }}>•</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "20px",
              fontWeight: 700,
              color: "#cbd5e1",
            }}
          >
            🛡️ Escrow by Razorpay
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
