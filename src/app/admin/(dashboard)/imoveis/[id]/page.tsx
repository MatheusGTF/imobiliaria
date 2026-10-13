import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImovelForm } from "../ImovelForm";
import { FotoManager } from "./FotoManager";
import { VendaManager } from "./VendaManager";
import { updateImovel, deleteImovel } from "../actions";
import { BotaoExcluir } from "@/components/admin/BotaoExcluir";
import { Card } from "@/components/ui/Card";
import { aceitaVenda } from "@/lib/constants";

export default async function EditarImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [imovel, proprietarios, inquilinos] = await Promise.all([
    prisma.imovel.findUnique({ where: { id }, include: { fotos: { orderBy: { ordem: "asc" } } } }),
    prisma.proprietario.findMany({ orderBy: { nome: "asc" } }),
    prisma.inquilino.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!imovel) notFound();

  const updateWithId = updateImovel.bind(null, id);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{imovel.titulo}</h1>
        <Link href="/admin/imoveis" className="text-sm text-slate-500 hover:underline">
          Voltar para a lista
        </Link>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-medium text-slate-900">Fotos</h2>
        <FotoManager imovelId={imovel.id} fotos={imovel.fotos} />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-medium text-slate-900">Dados do imóvel</h2>
        <ImovelForm
          imovel={imovel}
          proprietarios={proprietarios}
          inquilinos={inquilinos}
          action={updateWithId}
        />
      </Card>

      {aceitaVenda(imovel.finalidade) && (
        <Card>
          <h2 className="mb-4 text-lg font-medium text-slate-900">Venda</h2>
          <VendaManager imovel={imovel} />
        </Card>
      )}

      <Card className="border-red-200">
        <h2 className="mb-2 text-lg font-medium text-red-700">Excluir imóvel</h2>
        <p className="mb-4 text-sm text-slate-500">
          Remove o imóvel, suas fotos e contratos vinculados não poderão mais referenciá-lo.
        </p>
        <BotaoExcluir
          acao={deleteImovel.bind(null, imovel.id)}
          redirecionarPara="/admin/imoveis"
          confirmacao="Excluir este imóvel e todas as suas fotos?"
          label="Excluir imóvel"
        />
      </Card>
    </div>
  );
}
