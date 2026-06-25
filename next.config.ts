import type { NextConfig } from "next";

const repoName = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY_NAME || "travel-map";
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProduction ? `/${repoName}` : "",
  assetPrefix: isProduction ? `/${repoName}/` : "",
  images: {
    unoptimized: true
  }
};

export default nextConfig;
