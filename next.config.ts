import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos hospedadas no Vercel Blob (produção).
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    // As imagens já chegam pequenas (redimensionadas no navegador), mas
    // damos margem para o server action que recebe o upload.
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
