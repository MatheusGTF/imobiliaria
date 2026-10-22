import type { Metadata } from "next";

// A página de login é gerada a cada visita (não estática) para receber o
// "nonce" da política de segurança de conteúdo definida em src/proxy.ts.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel administrativo",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
