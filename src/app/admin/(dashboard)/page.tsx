import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { STATUS_PAGAMENTO, labelFor, statusEfetivoPagamento } from "@/lib/constants";
import { avisoTermino, limiteAvisoTermino, DIAS_AVISO_TERMINO } from "@/lib/avisos";
import { Building2, FileText, Wallet, AlertTriangle, BellRing } from "lucide-react";

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
    contratosAVencer,
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
    // Contratos ativos que terminam em breve (ou que já passaram do fim).
    prisma.contrato.findMany({
      where: { status: "ATIVO", dataFim: { lte: limiteAvisoTermino(hoje) } },
      include: { imovel: { include: { proprietario: true } }, inquilino: true },
      orderBy: { dataFim: "asc" },
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
        <div className="mb-1 flex items-center gap-2">
          <BellRing className="text-amber-600" size={18} />
          <h2 className="font-medium text-slate-900">Avisos de término e renovação de contrato</h2>
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Contratos ativos que terminam em até {DIAS_AVISO_TERMINO} dias (ou já passaram do prazo).
          Hora de conversar com o proprietário e o inquilino sobre a renovação.
        </p>
        {contratosAVencer.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum contrato perto do vencimento.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {contratosAVencer.map((c) => {
              const aviso = avisoTermino(c.dataFim, hoje);
              const proprietario = c.imovel.proprietario;
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <Link href={`/admin/contratos/${c.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.imovel.titulo}
                    </Link>
                    <p className="text-slate-500">
                      Inquilino: {c.inquilino.nome}
                      {c.inquilino.telefone ? ` · ${c.inquilino.telefone}` : ""}
                    </p>
                    {proprietario && (
                      <p className="text-slate-500">
                        Proprietário: {proprietario.nome}
                        {proprietario.telefone ? ` · ${proprietario.telefone}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">Termina em {formatDate(c.dataFim)}</span>
                    {aviso && <Badge color={aviso.cor}>{aviso.texto}</Badge>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

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
