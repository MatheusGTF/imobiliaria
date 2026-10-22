import type { Metadata } from "next";
import Link from "next/link";
import { getEmpresa } from "@/lib/comum/empresa";
import { parseInstagram } from "@/lib/comum/format";
import { Logo } from "@/components/site/Logo";
import { InstagramIcon } from "@/components/site/InstagramIcon";

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
  const instagram = parseInstagram(empresa.instagram);
  const ano = new Date().getFullYear();
  const telefones = [empresa.telefone, empresa.telefone2].filter(Boolean) as string[];

  const navLink =
    "rounded-full px-2.5 py-2 transition-colors hover:bg-brand-50 hover:text-brand-700 sm:px-3";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" aria-label={empresa.nome} className="min-w-0">
            <Logo nome={empresa.nome} logoUrl={empresa.logoUrl} />
          </Link>
          <nav className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-ink-600 sm:gap-1">
            <Link href="/imoveis?finalidade=ALUGUEL" className={navLink}>
              Alugar
            </Link>
            <Link href="/imoveis?finalidade=VENDA" className={navLink}>
              Comprar
            </Link>
            <Link href="/imoveis" className={`hidden sm:block ${navLink}`}>
              Todos os imóveis
            </Link>
            <Link
              href="/contato"
              className="rounded-full bg-brand-600 px-3 py-2 text-white transition-colors hover:bg-brand-700 sm:px-4"
            >
              Contatos
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-ink-100 bg-ink-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-ink-500 sm:px-6">
          <Logo nome={empresa.nome} logoUrl={empresa.logoUrl} variant="footer" />
          {empresa.endereco && <p>{empresa.endereco}</p>}
          {telefones.length > 0 && <p>Fone: {telefones.join(" · ")}</p>}
          {instagram && (
            <a
              href={instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700"
            >
              <InstagramIcon size={15} /> {instagram.handle}
            </a>
          )}
          <p className="text-ink-400">
            © {ano} {empresa.nome}
            {empresa.responsavelCreci ? ` · CRECI ${empresa.responsavelCreci}` : ""}
            {empresa.responsavel2Creci ? ` · CRECI ${empresa.responsavel2Creci}` : ""}. Todos os
            direitos reservados.
          </p>
          <Link href="/privacidade" className="font-semibold text-ink-500 underline-offset-2 hover:text-brand-700 hover:underline">
            Política de Privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}
