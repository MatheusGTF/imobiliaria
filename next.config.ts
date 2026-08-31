import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos hospedadas no Vercel Blob (produção).
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
