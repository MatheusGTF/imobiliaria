import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BuscaForm } from "@/components/admin/BuscaForm";
import { formatCurrency, formatDate } from "@/lib/comum/format";
import { ruaENumero } from "@/lib/imoveis/locacao";
import { Plus, Users, Home } from "lucide-react";

const imovelResumo = { id: true, titulo: true, logradouro: true, numero: true, complemento: true, bairro: true } as const;

export default async function InquilinosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const termo = q?.trim() ?? "";

  const contem = (campo: string) => ({ [campo]: { contains: termo, mode: "insensitive" as const } });
  const doImovel = { OR: [contem("titulo"), contem("bairro"), contem("logradouro")] };

  const where: Prisma.InquilinoWhereInput | undefined = termo
    ? {
        OR: [
          contem("nome"),
          contem("telefone"),
          { contratos: { some: { imovel: doImovel } } },
          { imoveis: { some: doImovel } },
        ],
      }
    : undefined;

  const inquilinos = await prisma.inquilino.findMany({
    where,
    orderBy: { nome: "asc" },
    include: {
      contratos: {
        orderBy: { dataInicio: "desc" },
        include: { imovel: { select: imovelResumo } },
      },
      // Imóveis em que consta como inquilino (inclui locações sem contrato no sistema).
      imoveis: { where: { status: "ALUGADO" }, select: imovelResumo },
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Inquilinos</h1>
          <p className="text-sm text-slate-500">Mostra o imóvel que cada inquilino aluga</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <BuscaForm q={termo} placeholder="Pesquisar inquilino, imóvel ou bairro..." limparHref="/admin/inquilinos" />
          <Link href="/admin/inquilinos/novo">
            <Button>
              <Plus size={16} /> Novo inquilino
            </Button>
          </Link>
        </div>
      </div>

      {inquilinos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <Users className="mx-auto mb-3 text-slate-300" size={40} />
          {termo ? `Nenhum inquilino encontrado para "${termo}".` : "Nenhum inquilino cadastrado ainda."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome do inquilino</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Imóvel alugado</th>
                <th className="px-4 py-3">Endereço</th>
                <th className="px-4 py-3">Início</th>
                <th className="px-4 py-3">Término</th>
                <th className="px-4 py-3">Aluguel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Contratos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inquilinos.map((i) => {
                const ativos = i.contratos.filter((c) => c.status === "ATIVO");
                const contrato = ativos[0];
                // Locações registradas só no imóvel (sem contrato ativo no sistema).
                const manuais = i.imoveis.filter((im) => !ativos.some((c) => c.imovelId === im.id));
                const manual = manuais[0];
                const imovel = contrato?.imovel ?? manual;
                const outros = Math.max(ativos.length + manuais.length - 1, 0);

                return (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/inquilinos/${i.id}`} className="font-medium text-slate-900 hover:underline">
                        {i.nome}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{i.telefone ?? "-"}</td>
                    <td className="px-4 py-3">
                      {imovel ? (
                        <Link
                          href={`/admin/imoveis/${imovel.id}`}
                          className="inline-flex items-center gap-1.5 text-slate-800 hover:underline"
                        >
                          <Home size={14} className="shrink-0 text-emerald-600" /> {imovel.titulo}
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                      {outros > 0 && <span className="ml-1 text-xs text-slate-500">+{outros}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {imovel ? (
                        <>
                          {ruaENumero(imovel)}
                          {imovel.bairro && <span className="block text-xs text-slate-400">{imovel.bairro}</span>}
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {contrato ? formatDate(contrato.dataInicio) : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {contrato ? formatDate(contrato.dataFim) : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {contrato ? formatCurrency(contrato.valorAluguel) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {contrato ? (
                        <Badge color="green">Ativo</Badge>
                      ) : manual ? (
                        <Badge color="blue">Alugando (sem contrato)</Badge>
                      ) : (
                        <Badge color="gray">{i.contratos.length > 0 ? "Sem locação ativa" : "Sem contrato"}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{i.contratos.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
