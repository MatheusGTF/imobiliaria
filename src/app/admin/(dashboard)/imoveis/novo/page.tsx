import { prisma } from "@/lib/prisma";
import { ImovelForm } from "../ImovelForm";
import { createImovel } from "../actions";

export default async function NovoImovelPage() {
  const proprietarios = await prisma.proprietario.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Novo imóvel</h1>
      <ImovelForm proprietarios={proprietarios} action={createImovel} />
    </div>
  );
}
