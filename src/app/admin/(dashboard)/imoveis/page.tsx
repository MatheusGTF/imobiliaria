import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BuscaForm } from "@/components/admin/BuscaForm";
import { STATUS_IMOVEL, TIPOS_IMOVEL, labelFor } from "@/lib/constants";
import { PrecoImovel } from "@/components/PrecoImovel";
import { ruaENumero, tiposQueCasam } from "@/lib/locacao";
import { Plus, Building2 } from "lucide-react";

export default async function ImoveisPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const termo = q?.trim() ?? "";

  const contem = (campo: string) => ({ [campo]: { contains: termo, mode: "insensitive" as const } });
  const tipos = tiposQueCasam(termo);

  const where: Prisma.ImovelWhereInput | undefined = termo
    ? {
        OR: [
          contem("titulo"),
          contem("logradouro"),
          contem("bairro"),
          contem("cidade"),
          { inquilino: contem("nome") },
          { proprietario: contem("nome") },
          { contratos: { some: { status: "ATIVO", inquilino: contem("nome") } } },
          ...(tipos.length ? [{ tipo: { in: [...tipos] } }] : []),
        ],
      }
    : undefined;

  const imoveis = await prisma.imovel.findMany({
    where,
    include: {
      fotos: { where: { capa: true }, take: 1 },
      proprietario: { select: { nome: true } },
      inquilino: { select: { id: true, nome: true } },
      // A locação ativa é a fonte da verdade para "inquilino atual".
      contratos: {
        where: { status: "ATIVO" },
        take: 1,
        orderBy: { dataInicio: "desc" },
        include: { inquilino: { select: { id: true, nome: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Imóveis</h1>
          <p className="text-sm text-slate-500">Lista de todos os imóveis cadastrados</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <BuscaForm q={termo} placeholder="Pesquisar por endereço, bairro ou tipo..." limparHref="/admin/imoveis" />
          <Link href="/admin/imoveis/novo">
            <Button>
              <Plus size={16} /> Novo imóvel
            </Button>
          </Link>
        </div>
      </div>

      {imoveis.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <Building2 className="mx-auto mb-3 text-slate-300" size={40} />
          {termo ? `Nenhum imóvel encontrado para "${termo}".` : "Nenhum imóvel cadastrado ainda."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Endereço</th>
                <th className="px-4 py-3">Bairro</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Inquilino atual</th>
                <th className="px-4 py-3">Proprietário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {imoveis.map((imovel) => {
                const status = STATUS_IMOVEL.find((s) => s.value === imovel.status);
                const capa = imovel.fotos[0];
                const inquilinoAtual =
                  imovel.status === "ALUGADO" ? (imovel.contratos[0]?.inquilino ?? imovel.inquilino) : null;
                return (
                  <tr key={imovel.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link href={`/admin/imoveis/${imovel.id}`} className="block">
                        <div className="relative h-11 w-16 overflow-hidden rounded bg-slate-100">
                          {capa ? (
                            <Image src={capa.url} alt="" fill className="object-cover" sizes="64px" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-300">
                              <Building2 size={18} />
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/admin/imoveis/${imovel.id}`} className="font-medium text-slate-900 hover:underline">
                        {imovel.titulo}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{labelFor(TIPOS_IMOVEL, imovel.tipo)}</td>
                    <td className="px-4 py-2 text-slate-600">{ruaENumero(imovel)}</td>
                    <td className="px-4 py-2 text-slate-600">{imovel.bairro ?? "-"}</td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <PrecoImovel imovel={imovel} className="text-sm font-medium text-slate-800" />
                    </td>
                    <td className="px-4 py-2">
                      <Badge color={status?.color}>{status?.label ?? imovel.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {inquilinoAtual ? (
                        <Link href={`/admin/inquilinos/${inquilinoAtual.id}`} className="hover:underline">
                          {inquilinoAtual.nome}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{imovel.proprietario?.nome ?? "-"}</td>
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
