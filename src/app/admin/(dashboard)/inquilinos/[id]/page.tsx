import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InquilinoForm } from "../InquilinoForm";
import { updateInquilino, deleteInquilino } from "../actions";
import { BotaoExcluir } from "@/components/admin/BotaoExcluir";
import { Card } from "@/components/ui/Card";

export default async function EditarInquilinoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquilino = await prisma.inquilino.findUnique({ where: { id } });
  if (!inquilino) notFound();

  const updateWithId = updateInquilino.bind(null, id);

  return (
    <div className="max-w-xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{inquilino.nome}</h1>
        <Link href="/admin/inquilinos" className="text-sm text-slate-500 hover:underline">
          Voltar para a lista
        </Link>
      </div>

      <Card>
        <InquilinoForm inquilino={inquilino} action={updateWithId} />
      </Card>

      <Card className="border-red-200">
        <h2 className="mb-2 text-lg font-medium text-red-700">Excluir inquilino</h2>
        <BotaoExcluir
          acao={deleteInquilino.bind(null, inquilino.id)}
          redirecionarPara="/admin/inquilinos"
          confirmacao="Excluir este inquilino?"
          label="Excluir inquilino"
        />
      </Card>
    </div>
  );
}
