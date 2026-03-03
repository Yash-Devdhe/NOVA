import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".dist/next",
  outputFileTracingRoot: path.resolve(process.cwd()),
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js"],
  },
};

export default nextConfig;
