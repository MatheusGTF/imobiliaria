import Link from "next/link";
import { Search, Building2, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getEmpresa } from "@/lib/empresa";
import { contarDisponiveisPorTipo } from "@/lib/imoveis";
import { ImovelCard } from "@/components/site/ImovelCard";
import { TipoCard } from "@/components/site/TipoCard";

// A vitrine reflete o estoque atual (imóveis e configurações mudam pelo /admin).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [empresa, { porTipo, total }] = await Promise.all([
    getEmpresa(),
    contarDisponiveisPorTipo(),
  ]);

  const destaques = await prisma.imovel.findMany({
    where: { status: "DISPONIVEL", destaque: true },
    include: { fotos: { where: { capa: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const recentes =
    destaques.length > 0
      ? []
      : await prisma.imovel.findMany({
          where: { status: "DISPONIVEL" },
          include: { fotos: { where: { capa: true }, take: 1 } },
          orderBy: { createdAt: "desc" },
          take: 6,
        });

  const imoveis = destaques.length > 0 ? destaques : recentes;
  const cidade = empresa.endereco?.match(/,\s*([^,/]+)\/[A-Z]{2}/)?.[1]?.trim();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-ink-900 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-ink-900/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-white/20">
            {empresa.nome}
            {cidade ? ` · ${cidade}` : ""}
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.1] sm:text-6xl">
            O seu próximo endereço começa aqui.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            Casas, apartamentos e terrenos selecionados para alugar ou comprar
            {cidade ? ` em ${cidade} e região` : ""}.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/imoveis?finalidade=ALUGUEL"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <Search size={18} /> Quero alugar
            </Link>
            <Link
              href="/imoveis?finalidade=VENDA"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-6 py-3 font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-brand-500/40"
            >
              <Search size={18} /> Quero comprar
            </Link>
          </div>
        </div>
      </section>

      {/* Consulte por tipo */}
      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink-900">O que temos disponível</h2>
              <p className="mt-1 text-sm text-ink-500">
                {total > 0
                  ? `${total} ${total === 1 ? "imóvel disponível" : "imóveis disponíveis"} agora — escolha por tipo.`
                  : "Nenhum imóvel disponível no momento. Volte em breve!"}
              </p>
            </div>
            <Link
              href="/imoveis"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {porTipo.map(({ tipo, total }) => (
              <TipoCard key={tipo} tipo={tipo} total={total} />
            ))}
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-6 font-display text-2xl font-bold text-ink-900">
          {destaques.length > 0 ? "Imóveis em destaque" : "Últimos imóveis cadastrados"}
        </h2>

        {imoveis.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 py-16 text-center text-ink-400">
            <Building2 size={40} />
            <p>Nenhum imóvel disponível no momento. Volte em breve!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {imoveis.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
