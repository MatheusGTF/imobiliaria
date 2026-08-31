import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProprietarioForm } from "../ProprietarioForm";
import { updateProprietario, deleteProprietario } from "../actions";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Card } from "@/components/ui/Card";

export default async function EditarProprietarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proprietario = await prisma.proprietario.findUnique({ where: { id } });
  if (!proprietario) notFound();

  const updateWithId = updateProprietario.bind(null, id);

  return (
    <div className="max-w-xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{proprietario.nome}</h1>
        <Link href="/admin/proprietarios" className="text-sm text-slate-500 hover:underline">
          Voltar para a lista
        </Link>
      </div>

      <Card>
        <ProprietarioForm proprietario={proprietario} action={updateWithId} />
      </Card>

      <Card className="border-red-200">
        <h2 className="mb-2 text-lg font-medium text-red-700">Excluir proprietário</h2>
        <form action={deleteProprietario}>
          <input type="hidden" name="id" value={proprietario.id} />
          <DeleteButton label="Excluir proprietário" />
        </form>
      </Card>
    </div>
  );
}
