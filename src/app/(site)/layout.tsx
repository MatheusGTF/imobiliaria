import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getEmpresa } from "@/lib/empresa";
import { Logo } from "@/components/site/Logo";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export async function generateMetadata(): Promise<Metadata> {
  const empresa = await getEmpresa();
  return {
    title: {
      default: `${empresa.nome} | Casas, apartamentos e terrenos`,
      template: `%s | ${empresa.nome}`,
    },
    description: `Imóveis para alugar e comprar com a ${empresa.nome}. Consulte casas, apartamentos e terrenos disponíveis.`,
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const empresa = await getEmpresa();
  const ano = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" aria-label={empresa.nome} className="shrink-0">
            <Logo nome={empresa.nome} logoUrl={empresa.logoUrl} />
          </Link>
          <nav className="flex items-center gap-0.5 text-sm font-semibold text-ink-600 sm:gap-2">
            <Link
              href="/imoveis?finalidade=ALUGUEL"
              className="rounded-full px-2.5 py-2 transition-colors hover:bg-brand-50 hover:text-brand-700 sm:px-3"
            >
              Alugar
            </Link>
            <Link
              href="/imoveis?finalidade=VENDA"
              className="rounded-full px-2.5 py-2 transition-colors hover:bg-brand-50 hover:text-brand-700 sm:px-3"
            >
              Comprar
            </Link>
            <Link
              href="/imoveis"
              className="hidden rounded-full px-3 py-2 transition-colors hover:bg-brand-50 hover:text-brand-700 sm:block"
            >
              Todos os imóveis
            </Link>
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                <MessageCircle size={16} /> Contato
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-ink-100 bg-ink-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-ink-500 sm:px-6">
          <Logo nome={empresa.nome} logoUrl={empresa.logoUrl} variant="footer" />
          {empresa.endereco && <p>{empresa.endereco}</p>}
          {empresa.telefone && <p>Fone: {empresa.telefone}</p>}
          <p className="text-ink-400">
            © {ano} {empresa.nome}
            {empresa.responsavelCreci ? ` · CRECI ${empresa.responsavelCreci}` : ""}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
