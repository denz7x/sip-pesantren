import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-side rendering untuk API routes yang menggunakan cookies
  // Tidak menggunakan static export karena app menggunakan authentication dengan cookies
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
