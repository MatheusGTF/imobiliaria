import Link from "next/link";
import { Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ImovelCard } from "@/components/site/ImovelCard";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { TIPOS_IMOVEL, TIPOS_VITRINE } from "@/lib/constants";
import { contarDisponiveisPorTipo } from "@/lib/imoveis";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type Filtros = {
  cidade?: string;
  tipo?: string;
  finalidade?: string;
  quartos?: string;
  valorMax?: string;
};

function hrefComTipo(filtros: Filtros, tipo: string | null) {
  const params = new URLSearchParams();
  if (filtros.finalidade) params.set("finalidade", filtros.finalidade);
  if (filtros.cidade) params.set("cidade", filtros.cidade);
  if (tipo) params.set("tipo", tipo);
  const qs = params.toString();
  return qs ? `/imoveis?${qs}` : "/imoveis";
}

export default async function ImoveisListPage({
  searchParams,
}: {
  searchParams: Promise<Filtros>;
}) {
  const filtros = await searchParams;
  const { cidade, tipo, finalidade, quartos, valorMax } = filtros;

  const where: Prisma.ImovelWhereInput = { status: "DISPONIVEL" };
  if (cidade) where.cidade = { contains: cidade };
  if (tipo) where.tipo = tipo;
  if (quartos) where.quartos = { gte: Number(quartos) };

  if (finalidade === "ALUGUEL") {
    where.finalidade = { in: ["ALUGUEL", "AMBOS"] };
    if (valorMax) where.valorAluguel = { lte: Number(valorMax) };
  } else if (finalidade === "VENDA") {
    where.finalidade = { in: ["VENDA", "AMBOS"] };
    if (valorMax) where.valorVenda = { lte: Number(valorMax) };
  }

  const [imoveis, { porTipo, total }] = await Promise.all([
    prisma.imovel.findMany({
      where,
      include: { fotos: { where: { capa: true }, take: 1 } },
      orderBy: [{ destaque: "desc" }, { createdAt: "desc" }],
    }),
    contarDisponiveisPorTipo(),
  ]);

  const totalPorTipo = new Map(porTipo.map((t) => [t.tipo, t.total]));

  const titulo =
    finalidade === "ALUGUEL"
      ? "Imóveis para alugar"
      : finalidade === "VENDA"
        ? "Imóveis à venda"
        : "Todos os imóveis disponíveis";

  const tiposComImovel = TIPOS_VITRINE.filter((t) => (totalPorTipo.get(t) ?? 0) > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink-900">{titulo}</h1>
      <p className="mt-1 text-sm text-ink-500">
        {total} {total === 1 ? "imóvel disponível" : "imóveis disponíveis"} no total
        {tipo ? ` · filtrando por ${TIPOS_IMOVEL.find((t) => t.value === tipo)?.plural ?? tipo}` : ""}
      </p>

      {/* Chips por tipo */}
      <div className="mt-5 flex flex-wrap gap-2">
        <TipoChip href={hrefComTipo(filtros, null)} ativo={!tipo} label="Todos" total={total} />
        {tiposComImovel.map((t) => (
          <TipoChip
            key={t}
            href={hrefComTipo(filtros, t)}
            ativo={tipo === t}
            label={TIPOS_IMOVEL.find((x) => x.value === t)?.plural ?? t}
            total={totalPorTipo.get(t) ?? 0}
          />
        ))}
      </div>

      {/* Filtros */}
      <form
        method="get"
        className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-ink-100 bg-ink-50 p-4 sm:grid-cols-6"
      >
        {tipo && <input type="hidden" name="tipo" value={tipo} />}
        <select
          name="finalidade"
          defaultValue={finalidade ?? ""}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="">Alugar ou comprar</option>
          <option value="ALUGUEL">Alugar</option>
          <option value="VENDA">Comprar</option>
        </select>
        <input
          type="text"
          name="cidade"
          placeholder="Cidade"
          defaultValue={cidade}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        <select
          name="quartos"
          defaultValue={quartos ?? ""}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="">Quartos (mín.)</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
        <MoneyInput
          name="valorMax"
          placeholder="Valor máximo"
          defaultValue={valorMax ? Number(valorMax) : null}
          disabled={!finalidade}
          title={!finalidade ? "Escolha alugar ou comprar para filtrar por valor" : undefined}
          wrapperClassName="sm:col-span-2"
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 disabled:bg-ink-100 disabled:text-ink-400"
        />
        <button
          type="submit"
          className="col-span-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:col-span-1"
        >
          Filtrar
        </button>
      </form>

      {imoveis.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 py-16 text-center text-ink-400">
          <Building2 size={40} />
          <p>Nenhum imóvel encontrado com esses filtros.</p>
          <Link href="/imoveis" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Limpar filtros
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {imoveis.map((imovel) => (
            <ImovelCard key={imovel.id} imovel={imovel} />
          ))}
        </div>
      )}
    </div>
  );
}

function TipoChip({
  href,
  ativo,
  label,
  total,
}: {
  href: string;
  ativo: boolean;
  label: string;
  total: number;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        ativo
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 text-xs ${
          ativo ? "bg-white/20 text-white" : "bg-ink-100 text-ink-500"
        }`}
      >
        {total}
      </span>
    </Link>
  );
}
