import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { BotaoExcluir } from "@/components/admin/BotaoExcluir";
import { STATUS_CONTRATO, STATUS_PAGAMENTO, labelFor, statusEfetivoPagamento } from "@/lib/constants";
import { formatCurrency, formatDate, formatMonth } from "@/lib/format";
import { encerrarContrato, deleteContrato } from "../actions";
import { FileText } from "lucide-react";

export default async function ContratoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: {
      imovel: true,
      inquilino: true,
      pagamentos: { orderBy: { mesReferencia: "asc" } },
    },
  });

  if (!contrato) notFound();

  const status = STATUS_CONTRATO.find((s) => s.value === contrato.status);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{contrato.imovel.titulo}</h1>
          <p className="text-sm text-slate-500">Inquilino: {contrato.inquilino.nome}</p>
        </div>
        <Link href="/admin/contratos" className="text-sm text-slate-500 hover:underline">
          Voltar para a lista
        </Link>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">Dados do contrato</h2>
          <Badge color={status?.color}>{labelFor(STATUS_CONTRATO, contrato.status)}</Badge>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Início</dt>
            <dd className="font-medium text-slate-900">{formatDate(contrato.dataInicio)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Término</dt>
            <dd className="font-medium text-slate-900">{formatDate(contrato.dataFim)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Vencimento</dt>
            <dd className="font-medium text-slate-900">Todo dia {contrato.diaVencimento}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Aluguel</dt>
            <dd className="font-medium text-slate-900">{formatCurrency(contrato.valorAluguel)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Condomínio</dt>
            <dd className="font-medium text-slate-900">{formatCurrency(contrato.valorCondominio)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">IPTU</dt>
            <dd className="font-medium text-slate-900">{formatCurrency(contrato.valorIptu)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Caução</dt>
            <dd className="font-medium text-slate-900">{formatCurrency(contrato.valorCaucao)}</dd>
          </div>
        </dl>
        {contrato.bensInclusos && (
          <p className="mt-4 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Bens inclusos: </span>
            {contrato.bensInclusos}
          </p>
        )}
        {contrato.observacoes && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{contrato.observacoes}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/admin/contratos/${contrato.id}/documento`}>
            <Button variant="secondary">
              <FileText size={16} /> Gerar contrato
            </Button>
          </Link>
          {contrato.status === "ATIVO" && (
            <form action={encerrarContrato}>
              <input type="hidden" name="id" value={contrato.id} />
              <ConfirmButton confirmMessage="Encerrar este contrato? Pagamentos pendentes futuros serão cancelados.">
                Encerrar contrato
              </ConfirmButton>
            </form>
          )}
          <BotaoExcluir
            acao={deleteContrato.bind(null, contrato.id)}
            redirecionarPara="/admin/contratos"
            confirmacao="Excluir este contrato e seus recebíveis pendentes?"
            confirmacaoForcada="ATENÇÃO: isso apaga o contrato e TODAS as parcelas, inclusive as já pagas (o histórico financeiro deste contrato some). Não dá para desfazer. Excluir mesmo assim?"
            label="Excluir contrato"
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-medium text-slate-900">Recebíveis</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Mês</th>
                <th className="py-2 pr-4">Vencimento</th>
                <th className="py-2 pr-4">Valor</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Pago em</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contrato.pagamentos.map((p) => {
                const efetivo = statusEfetivoPagamento(p);
                const badge = STATUS_PAGAMENTO.find((s) => s.value === efetivo);
                return (
                  <tr key={p.id}>
                    <td className="py-2 pr-4 capitalize">{formatMonth(p.mesReferencia)}</td>
                    <td className="py-2 pr-4">{formatDate(p.dataVencimento)}</td>
                    <td className="py-2 pr-4">{formatCurrency(p.valorDevido)}</td>
                    <td className="py-2 pr-4">
                      <Badge color={badge?.color}>{labelFor(STATUS_PAGAMENTO, efetivo)}</Badge>
                    </td>
                    <td className="py-2 pr-4">{formatDate(p.dataPagamento)}</td>
                    <td className="py-2 pr-4 text-right">
                      <Link href={`/admin/financeiro/${p.id}`} className="text-emerald-700 hover:underline">
                        Gerenciar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
