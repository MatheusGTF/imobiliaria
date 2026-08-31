import { prisma } from "@/lib/prisma";
import { TIPOS_VITRINE } from "@/lib/constants";

/**
 * Quantos imóveis DISPONÍVEIS existem de cada tipo, na ordem da vitrine.
 * Usado na home ("consulte por tipo") e no topo da listagem.
 */
export async function contarDisponiveisPorTipo() {
  const grupos = await prisma.imovel.groupBy({
    by: ["tipo"],
    where: { status: "DISPONIVEL" },
    _count: { _all: true },
  });

  const mapa = new Map(grupos.map((g) => [g.tipo, g._count._all]));
  const porTipo = TIPOS_VITRINE.map((tipo) => ({ tipo, total: mapa.get(tipo) ?? 0 }));
  const total = porTipo.reduce((soma, t) => soma + t.total, 0);

  return { porTipo, total };
}
