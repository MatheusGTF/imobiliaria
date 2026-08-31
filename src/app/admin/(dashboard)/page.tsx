import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { STATUS_PAGAMENTO, labelFor, statusEfetivoPagamento } from "@/lib/constants";
import { Building2, FileText, Wallet, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const hoje = new Date();
  const inicioMes = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1));
  const fimMes = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1, 1));

  const [
    imoveisDisponiveis,
    imoveisAlugados,
    imoveisVendidos,
    contratosAtivos,
    pagamentosDoMes,
    proximosVencimentos,
  ] = await Promise.all([
    prisma.imovel.count({ where: { status: "DISPONIVEL" } }),
    prisma.imovel.count({ where: { status: "ALUGADO" } }),
    prisma.imovel.count({ where: { status: "VENDIDO" } }),
    prisma.contrato.count({ where: { status: "ATIVO" } }),
    prisma.pagamento.findMany({ where: { mesReferencia: { gte: inicioMes, lt: fimMes } } }),
    prisma.pagamento.findMany({
      where: { status: "PENDENTE" },
      include: { contrato: { include: { imovel: true, inquilino: true } } },
      orderBy: { dataVencimento: "asc" },
      take: 8,
    }),
  ]);

  const totalRecebido = pagamentosDoMes
    .filter((p) => p.status === "PAGO")
    .reduce((acc, p) => acc + (p.valorPago ?? 0), 0);
  const totalPendenteOuAtrasado = pagamentosDoMes
    .filter((p) => p.status !== "PAGO" && p.status !== "CANCELADO")
    .reduce((acc, p) => acc + p.valorDevido, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="flex items-center gap-4">
          <Building2 className="text-emerald-600" size={28} />
          <div>
            <p className="text-xs text-slate-500">Disponíveis</p>
            <p className="text-xl font-semibold text-slate-900">{imoveisDisponiveis}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Building2 className="text-blue-600" size={28} />
          <div>
            <p className="text-xs text-slate-500">Alugados</p>
            <p className="text-xl font-semibold text-slate-900">{imoveisAlugados}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Building2 className="text-blue-600" size={28} />
          <div>
            <p className="text-xs text-slate-500">Vendidos</p>
            <p className="text-xl font-semibold text-slate-900">{imoveisVendidos}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <FileText className="text-slate-600" size={28} />
          <div>
            <p className="text-xs text-slate-500">Contratos ativos</p>
            <p className="text-xl font-semibold text-slate-900">{contratosAtivos}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <Wallet className="text-emerald-600" size={28} />
          <div>
            <p className="text-xs text-slate-500">Recebido no mês</p>
            <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalRecebido)}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="text-amber-600" size={18} />
          <h2 className="font-medium text-slate-900">
            Pendente/atrasado no mês: {formatCurrency(totalPendenteOuAtrasado)}
          </h2>
        </div>

        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Próximos vencimentos
        </h3>
        {proximosVencimentos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum recebível pendente.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {proximosVencimentos.map((p) => {
              const efetivo = statusEfetivoPagamento(p);
              const badge = STATUS_PAGAMENTO.find((s) => s.value === efetivo);
              return (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <div>
                    <Link href={`/admin/financeiro/${p.id}`} className="font-medium text-slate-900 hover:underline">
                      {p.contrato.imovel.titulo}
                    </Link>
                    <span className="ml-2 text-slate-500">{p.contrato.inquilino.nome}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{formatDate(p.dataVencimento)}</span>
                    <span className="font-medium text-slate-900">{formatCurrency(p.valorDevido)}</span>
                    <Badge color={badge?.color}>{labelFor(STATUS_PAGAMENTO, efetivo)}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
