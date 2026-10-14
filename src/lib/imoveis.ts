import { prisma } from "@/lib/prisma";
import { TIPOS_VITRINE, TIPOS_VITRINE_FIXOS } from "@/lib/constants";

/**
 * Quantos imóveis DISPONÍVEIS existem de cada tipo, na ordem da vitrine.
 * Casa, apartamento e terreno sempre aparecem; os outros tipos só quando há
 * ao menos um disponível (evita uma vitrine cheia de cartões vazios).
 * Usado na home ("consulte por tipo") e no topo da listagem.
 */
export async function contarDisponiveisPorTipo() {
  const grupos = await prisma.imovel.groupBy({
    by: ["tipo"],
    where: { status: "DISPONIVEL" },
    _count: { _all: true },
  });

  const mapa = new Map(grupos.map((g) => [g.tipo, g._count._all]));
  const fixos: readonly string[] = TIPOS_VITRINE_FIXOS;
  const porTipo = TIPOS_VITRINE.map((tipo) => ({ tipo, total: mapa.get(tipo) ?? 0 })).filter(
    (t) => t.total > 0 || fixos.includes(t.tipo),
  );
  const total = porTipo.reduce((soma, t) => soma + t.total, 0);

  return { porTipo, total };
}
