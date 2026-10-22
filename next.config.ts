import type { NextConfig } from "next";

// Cabeçalhos de segurança aplicados a todas as respostas. A Política de Segurança
// de Conteúdo (CSP) é definida em src/proxy.ts, porque usa um "nonce" por requisição.
const cabecalhosGerais = [
  // O navegador só acessa o site por HTTPS (por 1 ano). Sem includeSubDomains/preload de propósito:
  // não trava subdomínios que um dia usem outro serviço (e-mail, por exemplo).
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  // O navegador não "adivinha" o tipo dos arquivos (evita um arquivo ser tratado como script).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Impede o site de ser colocado dentro de outro site (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // O site não usa câmera, microfone, localização etc. — fica tudo desligado.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

// O painel mostra dados pessoais de clientes: nada dele pode ficar guardado em
// cache (navegador, computador compartilhado ou intermediários) nem ser indexado.
const cabecalhosDoPainel = [
  { key: "Cache-Control", value: "no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // não anuncia que o site usa Next.js
  experimental: {
    // As imagens já chegam pequenas (redimensionadas no navegador), mas
    // damos margem para o server action que recebe o upload.
    serverActions: { bodySizeLimit: "3mb" },
  },
  images: {
    // O otimizador de imagens só aceita as nossas próprias rotas de fotos.
    localPatterns: [{ pathname: "/f/**" }, { pathname: "/uploads/**" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: cabecalhosGerais },
      { source: "/admin/:path*", headers: cabecalhosDoPainel },
    ];
  },
};

export default nextConfig;
