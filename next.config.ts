import type { NextConfig } from "next";

// Set by the GitHub Pages workflow so assets resolve under /<repository>/.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Published as a static site; data is served by the in-browser router in src/backend.
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: false,
};

export default nextConfig;
