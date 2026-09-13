/** @type {import('next').NextConfig} */

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https:;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://*.razorpay.com https://*.supabase.co wss://*.supabase.co https://*.vercel-insights.com https://*.vercel-analytics.com https://va.vercel-scripts.com;
    frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    block-all-mixed-content;
    upgrade-insecure-requests;
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

