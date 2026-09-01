import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // As imagens já chegam pequenas (redimensionadas no navegador), mas
    // damos margem para o server action que recebe o upload.
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
