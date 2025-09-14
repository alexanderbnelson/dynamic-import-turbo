import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['styled-jsx'],
  },
  transpilePackages: ['styled-jsx'],
};

export default nextConfig;
