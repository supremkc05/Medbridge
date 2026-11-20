import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app is a client-rendered dashboard backed by RTK Query, so prerendering
  // with Cache Components is not used.
};

export default nextConfig;
