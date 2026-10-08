import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const isDev = process.env.NODE_ENV === "development";

// Next.js injects its own small inline bootstrap scripts (framework-level,
// not from this app's code -- confirmed no dangerouslySetInnerHTML or raw
// <script> tags anywhere in src/), so script-src needs 'unsafe-inline' too;
// without it, hydration itself breaks (verified: blocking it caused a React
// hydration error on every page). This is the documented non-nonce fallback
// from Next's own CSP guide -- the stricter nonce-based approach requires
// forcing every page into dynamic rendering and threading a nonce through
// every script tag, too large a change to retrofit safely in one pass.
// style-src needs 'unsafe-inline' for the same reason: several components
// use React's style={{...}} prop (animation delays, dynamic positions).
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://*.ingest.us.sentry.io;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "noname-coo",
  project: "thefridge",
  // No SENTRY_AUTH_TOKEN is configured, so source map upload is skipped
  // (the plugin degrades gracefully, it doesn't fail the build) -- stack
  // traces in Sentry will show minified code until that's added later.
  silent: true,
});
