import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Plus, UserRound } from "lucide-react";

export default async function ProprietariosPage() {
  const proprietarios = await prisma.proprietario.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { imoveis: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Proprietários</h1>
        <Link href="/admin/proprietarios/novo">
          <Button>
            <Plus size={16} /> Novo proprietário
          </Button>
        </Link>
      </div>

      {proprietarios.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <UserRound className="mx-auto mb-3 text-slate-300" size={40} />
          Nenhum proprietário cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Imóveis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proprietarios.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/proprietarios/${p.id}`} className="font-medium text-slate-900 hover:underline">
                      {p.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.telefone ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{p.email ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{p._count.imoveis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
