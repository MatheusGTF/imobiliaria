import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { STATUS_PAGAMENTO, FORMAS_PAGAMENTO } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { updatePagamento } from "../actions";

function toDateInputValue(value: Date | null) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export default async function PagamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const pagamento = await prisma.pagamento.findUnique({
    where: { id },
    include: { contrato: { include: { imovel: true, inquilino: true } } },
  });

  if (!pagamento) notFound();

  const updateWithId = updatePagamento.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Recebível</h1>
        <Link href="/admin/financeiro" className="text-sm text-slate-500 hover:underline">
          Voltar
        </Link>
      </div>

      <Card>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Imóvel</dt>
            <dd className="font-medium text-slate-900">{pagamento.contrato.imovel.titulo}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Inquilino</dt>
            <dd className="font-medium text-slate-900">{pagamento.contrato.inquilino.nome}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Vencimento</dt>
            <dd className="font-medium text-slate-900">{formatDate(pagamento.dataVencimento)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Valor devido</dt>
            <dd className="font-medium text-slate-900">{formatCurrency(pagamento.valorDevido)}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <form action={updateWithId} className="space-y-4">
          <Select label="Status" name="status" defaultValue={pagamento.status} required>
            {STATUS_PAGAMENTO.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor pago (R$)"
              name="valorPago"
              type="number"
              step="0.01"
              min={0}
              defaultValue={pagamento.valorPago ?? ""}
            />
            <Input
              label="Data do pagamento"
              name="dataPagamento"
              type="date"
              defaultValue={toDateInputValue(pagamento.dataPagamento)}
            />
          </div>

          <Select label="Forma de pagamento" name="formaPagamento" defaultValue={pagamento.formaPagamento ?? ""}>
            <option value="">Não informado</option>
            {FORMAS_PAGAMENTO.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>

          <Textarea label="Observações" name="observacoes" defaultValue={pagamento.observacoes ?? ""} />

          <div className="flex justify-end">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
