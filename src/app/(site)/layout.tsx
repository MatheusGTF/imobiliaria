import Link from "next/link";
import { Building2 } from "lucide-react";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Imobiliária";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Building2 className="text-emerald-600" />
            {SITE_NAME}
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/imoveis?finalidade=ALUGUEL" className="hover:text-slate-900">
              Alugar
            </Link>
            <Link href="/imoveis?finalidade=VENDA" className="hover:text-slate-900">
              Comprar
            </Link>
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              >
                Fale conosco
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {SITE_NAME}. Todos os direitos reservados.
      </footer>
    </div>
  );
}
