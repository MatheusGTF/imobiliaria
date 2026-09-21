import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { STATUS_PAGAMENTO, labelFor, statusEfetivoPagamento } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { getEmpresa } from "@/lib/empresa";
import { dividirPagamento } from "@/lib/financeiro";
import { marcarComoPago } from "./actions";
import { Wallet } from "lucide-react";

function mesAtualStr() {
  const hoje = new Date();
  return `${hoje.getUTCFullYear()}-${String(hoje.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; status?: string }>;
}) {
  const { mes: mesParam, status: statusParam } = await searchParams;
  const mes = mesParam || mesAtualStr();
  const [ano, mesNum] = mes.split("-").map(Number);

  const inicioMes = new Date(Date.UTC(ano, mesNum - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mesNum, 1));

  const pagamentosDoMes = await prisma.pagamento.findMany({
    where: { mesReferencia: { gte: inicioMes, lt: fimMes } },
    include: { contrato: { include: { imovel: true, inquilino: true } } },
    orderBy: { dataVencimento: "asc" },
  });

  const empresa = await getEmpresa();
  const ativos = pagamentosDoMes.filter((p) => p.status !== "CANCELADO");
  const divisao = (p: (typeof pagamentosDoMes)[number], valor = p.valorDevido) =>
    dividirPagamento(valor, p.contrato, empresa);

  const totalPrevisto = ativos.reduce((acc, p) => acc + p.valorDevido, 0);
  const admPrevista = ativos.reduce((acc, p) => acc + divisao(p).administracao, 0);
  const repassePrevisto = ativos.reduce((acc, p) => acc + divisao(p).repasse, 0);
  const admRecebida = ativos
    .filter((p) => p.status === "PAGO")
    .reduce((acc, p) => acc + divisao(p, p.valorPago ?? p.valorDevido).administracao, 0);
  const totalRecebido = pagamentosDoMes
    .filter((p) => p.status === "PAGO")
    .reduce((acc, p) => acc + (p.valorPago ?? 0), 0);
  const totalPendente = pagamentosDoMes
    .filter((p) => statusEfetivoPagamento(p) === "PENDENTE")
    .reduce((acc, p) => acc + p.valorDevido, 0);
  const totalAtrasado = pagamentosDoMes
    .filter((p) => statusEfetivoPagamento(p) === "ATRASADO")
    .reduce((acc, p) => acc + p.valorDevido, 0);

  const pagamentosFiltrados = statusParam
    ? pagamentosDoMes.filter((p) => statusEfetivoPagamento(p) === statusParam)
    : pagamentosDoMes;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Financeiro</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Previsto no mês</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(totalPrevisto)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Recebido</p>
          <p className="mt-1 text-lg font-semibold text-emerald-700">{formatCurrency(totalRecebido)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Pendente</p>
          <p className="mt-1 text-lg font-semibold text-amber-700">{formatCurrency(totalPendente)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Atrasado</p>
          <p className="mt-1 text-lg font-semibold text-red-700">{formatCurrency(totalAtrasado)}</p>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">Sua administração prevista ({empresa.taxaAdministracaoPercentual}%)</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(admPrevista)}</p>
          <p className="mt-0.5 text-xs text-slate-400">Já recebida: {formatCurrency(admRecebida)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Repasse aos proprietários (previsto)</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(repassePrevisto)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Total dos aluguéis do mês</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(totalPrevisto)}</p>
          <p className="mt-0.5 text-xs text-slate-400">= administração + repasse</p>
        </Card>
      </div>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mês</label>
          <input
            type="month"
            name="mes"
            defaultValue={mes}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="w-48">
          <Select label="Status" name="status" defaultValue={statusParam ?? ""}>
            <option value="">Todos</option>
            {STATUS_PAGAMENTO.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      {pagamentosFiltrados.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <Wallet className="mx-auto mb-3 text-slate-300" size={40} />
          Nenhum recebível encontrado para este filtro.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Imóvel</th>
                <th className="px-4 py-3">Inquilino</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Valor do aluguel</th>
                <th className="px-4 py-3">Administração</th>
                <th className="px-4 py-3">Repasse</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagamentosFiltrados.map((p) => {
                const efetivo = statusEfetivoPagamento(p);
                const badge = STATUS_PAGAMENTO.find((s) => s.value === efetivo);
                const podeMarcarPago = efetivo === "PENDENTE" || efetivo === "ATRASADO";
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/contratos/${p.contratoId}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {p.contrato.imovel.titulo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.contrato.inquilino.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(p.dataVencimento)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(p.valorDevido)}</td>
                    {p.status === "CANCELADO" ? (
                      <td className="px-4 py-3 text-slate-400" colSpan={2}>
                        —
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-slate-600">
                          {formatCurrency(divisao(p).administracao)}
                          <span className="ml-1 text-xs text-slate-400">({divisao(p).taxa}%)</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {formatCurrency(divisao(p).repasse)}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3">
                      <Badge color={badge?.color}>{labelFor(STATUS_PAGAMENTO, efetivo)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        {podeMarcarPago && (
                          <form action={marcarComoPago}>
                            <input type="hidden" name="id" value={p.id} />
                            <Button type="submit" size="sm">
                              Marcar como pago
                            </Button>
                          </form>
                        )}
                        <Link href={`/admin/financeiro/${p.id}`} className="text-sm text-slate-500 hover:underline">
                          Detalhes
                        </Link>
                      </div>
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
