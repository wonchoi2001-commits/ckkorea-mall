import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const hostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;

  remotePatterns.push({
    protocol: "https",
    hostname,
  });
}

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    remotePatterns,
  },
};

export default nextConfig;
