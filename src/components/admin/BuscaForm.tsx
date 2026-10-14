import Link from "next/link";
import { Search, X } from "lucide-react";

/**
 * Campo de busca das listas do /admin. É um formulário GET comum: o termo vai
 * na URL (`?q=`) e a própria página (server component) filtra — sem JS.
 */
export function BuscaForm({ q, placeholder, limparHref }: { q?: string; placeholder: string; limparHref: string }) {
  return (
    <form method="get" className="relative w-full sm:max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        type="search"
        name="q"
        defaultValue={q ?? ""}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
      {q && (
        <Link
          href={limparHref}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
        >
          <X size={14} />
        </Link>
      )}
    </form>
  );
}
