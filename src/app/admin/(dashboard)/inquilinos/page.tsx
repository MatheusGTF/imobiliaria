import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Plus, Users } from "lucide-react";

export default async function InquilinosPage() {
  const inquilinos = await prisma.inquilino.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { contratos: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Inquilinos</h1>
        <Link href="/admin/inquilinos/novo">
          <Button>
            <Plus size={16} /> Novo inquilino
          </Button>
        </Link>
      </div>

      {inquilinos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <Users className="mx-auto mb-3 text-slate-300" size={40} />
          Nenhum inquilino cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Contratos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inquilinos.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/inquilinos/${i.id}`} className="font-medium text-slate-900 hover:underline">
                      {i.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{i.telefone ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{i.email ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{i._count.contratos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
