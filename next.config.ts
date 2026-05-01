import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/graphql",
        destination: "http://localhost:3000/graphql",
      },
    ];
  },
};

export default nextConfig;
