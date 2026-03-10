import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    outputFileTracingRoot: path.resolve(process.cwd()),
  },
};

export default nextConfig;
