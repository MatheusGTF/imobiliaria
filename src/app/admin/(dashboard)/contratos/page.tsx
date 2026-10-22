import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { STATUS_CONTRATO, labelFor } from "@/lib/comum/constants";
import { formatCurrency, formatDate } from "@/lib/comum/format";
import { avisoTermino } from "@/lib/contratos/avisos";
import { Plus, FileText } from "lucide-react";

export default async function ContratosPage() {
  const contratos = await prisma.contrato.findMany({
    include: { imovel: true, inquilino: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Contratos</h1>
        <Link href="/admin/contratos/novo">
          <Button>
            <Plus size={16} /> Novo contrato
          </Button>
        </Link>
      </div>

      {contratos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <FileText className="mx-auto mb-3 text-slate-300" size={40} />
          Nenhum contrato cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Imóvel</th>
                <th className="px-4 py-3">Inquilino</th>
                <th className="px-4 py-3">Vigência do contrato</th>
                <th className="px-4 py-3">Aluguel vence</th>
                <th className="px-4 py-3">Aluguel</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contratos.map((c) => {
                const status = STATUS_CONTRATO.find((s) => s.value === c.status);
                const aviso = c.status === "ATIVO" ? avisoTermino(c.dataFim) : null;
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/contratos/${c.id}`} className="font-medium text-slate-900 hover:underline">
                        {c.imovel.titulo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.inquilino.nome}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(c.dataInicio)} – {formatDate(c.dataFim)}
                      {aviso && (
                        <div className="mt-1">
                          <Badge color={aviso.cor}>{aviso.texto}</Badge>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">Todo dia {c.diaVencimento}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(c.valorAluguel)}</td>
                    <td className="px-4 py-3">
                      <Badge color={status?.color}>{labelFor(STATUS_CONTRATO, c.status)}</Badge>
                    </td>
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
