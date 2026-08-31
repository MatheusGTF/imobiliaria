import { prisma } from "@/lib/prisma";
import { ImovelCard } from "@/components/site/ImovelCard";
import { TIPOS_IMOVEL } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export default async function ImoveisListPage({
  searchParams,
}: {
  searchParams: Promise<{
    cidade?: string;
    tipo?: string;
    finalidade?: string;
    quartos?: string;
    valorMax?: string;
  }>;
}) {
  const { cidade, tipo, finalidade, quartos, valorMax } = await searchParams;

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

  const imoveis = await prisma.imovel.findMany({
    where,
    include: { fotos: { where: { capa: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  const titulo =
    finalidade === "ALUGUEL"
      ? "Imóveis para alugar"
      : finalidade === "VENDA"
        ? "Imóveis à venda"
        : "Imóveis para alugar e comprar";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">{titulo}</h1>

      <form method="get" className="mb-8 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-6">
        <select
          name="finalidade"
          defaultValue={finalidade ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
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
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select name="tipo" defaultValue={tipo ?? ""} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">Todos os tipos</option>
          {TIPOS_IMOVEL.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          name="quartos"
          defaultValue={quartos ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Quartos (mín.)</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
        <input
          type="number"
          name="valorMax"
          placeholder="Valor máximo"
          defaultValue={valorMax}
          disabled={!finalidade}
          title={!finalidade ? "Escolha alugar ou comprar para filtrar por valor" : undefined}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
        />
        <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Filtrar
        </button>
      </form>

      {imoveis.length === 0 ? (
        <p className="text-slate-500">Nenhum imóvel encontrado com esses filtros.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {imoveis.map((imovel) => (
            <ImovelCard key={imovel.id} imovel={imovel} />
          ))}
        </div>
      )}
    </div>
  );
}
