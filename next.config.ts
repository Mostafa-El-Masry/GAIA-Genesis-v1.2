import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/Healthtracker",
        destination: "/health",
        permanent: true,
      },
      {
        source: "/HealthTracker",
        destination: "/health",
        permanent: true,
      },
      {
        source: "/healthtracker",
        destination: "/health",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
