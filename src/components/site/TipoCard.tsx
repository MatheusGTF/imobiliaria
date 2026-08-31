import Link from "next/link";
import { Home, Building2, Trees, Store, Boxes, ArrowUpRight } from "lucide-react";
import { labelFor, TIPOS_IMOVEL } from "@/lib/constants";

const ICONE: Record<string, typeof Home> = {
  CASA: Home,
  APARTAMENTO: Building2,
  TERRENO: Trees,
  COMERCIAL: Store,
  OUTRO: Boxes,
};

export function TipoCard({ tipo, total }: { tipo: string; total: number }) {
  const Icone = ICONE[tipo] ?? Boxes;
  const plural =
    TIPOS_IMOVEL.find((t) => t.value === tipo)?.plural ?? labelFor(TIPOS_IMOVEL, tipo);
  const indisponivel = total === 0;

  return (
    <Link
      href={`/imoveis?tipo=${tipo}`}
      aria-disabled={indisponivel}
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-5 transition-all ${
        indisponivel
          ? "border-ink-100 bg-ink-50 text-ink-400"
          : "border-brand-100 bg-white text-ink-900 shadow-sm hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
      }`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          indisponivel ? "bg-ink-100 text-ink-300" : "bg-brand-50 text-brand-600"
        }`}
      >
        <Icone size={24} />
      </span>
      <span className="font-display text-lg font-bold">{plural}</span>
      <span className="text-sm">
        {indisponivel ? (
          "Nenhum disponível no momento"
        ) : (
          <>
            <span className="font-semibold text-brand-600">{total}</span>{" "}
            {total === 1 ? "disponível" : "disponíveis"}
          </>
        )}
      </span>
      {!indisponivel && (
        <ArrowUpRight
          size={18}
          className="absolute right-4 top-4 text-brand-300 transition-colors group-hover:text-brand-600"
        />
      )}
    </Link>
  );
}
