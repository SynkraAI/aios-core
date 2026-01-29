import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize native modules that can't be bundled
  serverExternalPackages: ['chokidar'],
};

export default nextConfig;
