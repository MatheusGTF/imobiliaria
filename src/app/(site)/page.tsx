import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImovelCard } from "@/components/site/ImovelCard";
import { Search } from "lucide-react";

export default async function HomePage() {
  const destaques = await prisma.imovel.findMany({
    where: { status: "DISPONIVEL", destaque: true },
    include: { fotos: { where: { capa: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const recentes = destaques.length > 0
    ? []
    : await prisma.imovel.findMany({
        where: { status: "DISPONIVEL" },
        include: { fotos: { where: { capa: true }, take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 6,
      });

  const imoveis = destaques.length > 0 ? destaques : recentes;

  return (
    <div>
      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Encontre o imóvel ideal para alugar ou comprar</h1>
          <p className="mt-3 text-slate-300">
            Apartamentos, casas e imóveis comerciais selecionados para você.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/imoveis?finalidade=ALUGUEL"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-3 font-medium hover:bg-emerald-700"
            >
              <Search size={18} /> Alugar
            </Link>
            <Link
              href="/imoveis?finalidade=VENDA"
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-medium text-slate-900 hover:bg-slate-100"
            >
              <Search size={18} /> Comprar
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">
          {destaques.length > 0 ? "Imóveis em destaque" : "Últimos imóveis cadastrados"}
        </h2>

        {imoveis.length === 0 ? (
          <p className="text-slate-500">Nenhum imóvel disponível no momento. Volte em breve!</p>
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
