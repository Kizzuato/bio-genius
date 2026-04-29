import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   experimental: {
    allowedDevOrigins: ["52.237.112.52"],
  } as any,
};

export default nextConfig;
