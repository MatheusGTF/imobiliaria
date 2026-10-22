import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { MoneyField } from "@/components/ui/MoneyInput";
import { Button } from "@/components/ui/Button";
import { ContratoImovelFields } from "../ContratoImovelFields";
import { createContrato } from "../actions";

export default async function NovoContratoPage({
  searchParams,
}: {
  searchParams: Promise<{ imovelId?: string; inquilinoId?: string }>;
}) {
  const { imovelId, inquilinoId } = await searchParams;
  const [imoveis, inquilinos] = await Promise.all([
    prisma.imovel.findMany({
      where: { status: "DISPONIVEL", finalidade: { in: ["ALUGUEL", "AMBOS"] } },
      orderBy: { titulo: "asc" },
    }),
    prisma.inquilino.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (imoveis.length === 0) {
    return (
      <div className="max-w-xl rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
        Não há imóveis disponíveis para locação no momento. Cadastre um imóvel com status
        &quot;Disponível&quot; antes de criar um contrato.
      </div>
    );
  }

  if (inquilinos.length === 0) {
    return (
      <div className="max-w-xl rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
        Cadastre ao menos um inquilino antes de criar um contrato.
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Novo contrato</h1>
      <form action={createContrato} className="space-y-6">
        <ContratoImovelFields
          imovelIdInicial={imovelId}
          imoveis={imoveis.map((i) => ({
            id: i.id,
            titulo: i.titulo,
            cidade: i.cidade,
            estado: i.estado,
            valorAluguel: i.valorAluguel ?? 0,
            valorCondominio: i.valorCondominio,
            valorIptu: i.valorIptu,
          }))}
        />

        <Select
          label="Inquilino"
          name="inquilinoId"
          required
          defaultValue={inquilinos.some((i) => i.id === inquilinoId) ? inquilinoId : ""}
        >
          <option value="" disabled>
            Selecione um inquilino
          </option>
          {inquilinos.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nome}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Início do contrato"
            name="dataInicio"
            type="date"
            required
            hint="Data em que a locação começa."
          />
          <Input
            label="Fim do contrato (vencimento)"
            name="dataFim"
            type="date"
            required
            hint="Data em que o contrato vence."
          />
          <Input
            label="Dia do vencimento do aluguel"
            name="diaVencimento"
            type="number"
            min={1}
            max={31}
            defaultValue={10}
            required
            hint="Todo mês, neste dia (1 a 31)."
          />
        </div>

        <Input
          label="Data de entrada do inquilino"
          name="dataEntrada"
          type="date"
          hint="Opcional. Quando o inquilino recebe as chaves, se for diferente do início do contrato."
        />

        <MoneyField
          label="Valor da caução"
          name="valorCaucao"
          placeholder="Ex.: igual a 1 mês de aluguel"
          hint="Opcional. Deixe em branco se não houver caução."
        />

        <Textarea
          label="Bens inclusos no imóvel"
          name="bensInclusos"
          placeholder="Ex: 02 aparelhos de ar-condicionado já instalados"
        />

        <Textarea label="Observações" name="observacoes" />

        <p className="text-xs text-slate-500">
          Dica: confira se o imóvel tem um proprietário cadastrado (com CPF, RG e
          endereço) e se os dados da imobiliária estão preenchidos em{" "}
          <Link href="/admin/configuracoes" className="underline">
            Configurações
          </Link>{" "}
          — essas informações entram automaticamente no contrato gerado. A sua taxa de
          administração é definida em Configurações e aparece só no Financeiro — nunca no
          contrato do cliente.
        </p>

        <div className="flex justify-end">
          <Button type="submit">Criar contrato e gerar documento</Button>
        </div>
      </form>
    </div>
  );
}
