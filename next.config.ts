import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";

if (!process.env.DOCKER) {
  dotenv.config({
    path: path.resolve(__dirname, "..", ".env.frontend"),
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "retrievo-s3.s3.amazonaws.com",
      },
    ]
  }
};

export default nextConfig;
