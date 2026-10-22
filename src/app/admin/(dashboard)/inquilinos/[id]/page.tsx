import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { InquilinoForm } from "../InquilinoForm";
import { updateInquilino, deleteInquilino } from "../actions";
import { BotaoExcluir } from "@/components/admin/BotaoExcluir";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { STATUS_CONTRATO, labelFor } from "@/lib/comum/constants";
import { formatCurrency, formatDate } from "@/lib/comum/format";
import { avisoTermino } from "@/lib/contratos/avisos";
import { ruaENumero } from "@/lib/imoveis/locacao";
import { Home, FileText, Wallet, Pencil } from "lucide-react";

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <dt className="text-slate-500">{rotulo}</dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export default async function InquilinoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquilino = await prisma.inquilino.findUnique({
    where: { id },
    include: {
      contratos: { orderBy: { dataInicio: "desc" }, include: { imovel: true } },
      imoveis: { where: { status: "ALUGADO" } },
    },
  });
  if (!inquilino) notFound();

  const updateWithId = updateInquilino.bind(null, id);

  const contrato = inquilino.contratos.find((c) => c.status === "ATIVO");
  const imovel = contrato?.imovel ?? inquilino.imoveis[0];
  const aviso = contrato ? avisoTermino(contrato.dataFim) : null;

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{inquilino.nome}</h1>
            {contrato ? <Badge color="green">Ativo</Badge> : <Badge color="gray">Sem locação ativa</Badge>}
            {aviso && <Badge color={aviso.cor}>{aviso.texto}</Badge>}
          </div>
          <p className="text-sm text-slate-500">
            {inquilino.tipoPessoa === "JURIDICA" ? "Pessoa jurídica" : "Locatário(a)"}
            {inquilino.telefone ? ` · ${inquilino.telefone}` : ""}
            {inquilino.email ? ` · ${inquilino.email}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/inquilinos" className="text-sm text-slate-500 hover:underline">
            Voltar para a lista
          </Link>
          <a href="#editar">
            <Button variant="secondary">
              <Pencil size={16} /> Editar inquilino
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-medium text-slate-900">
            <Home size={18} className="text-emerald-600" /> Imóvel alugado
          </h2>
          {imovel ? (
            <>
              <p className="font-medium text-slate-900">{imovel.titulo}</p>
              <p className="text-sm text-slate-600">{ruaENumero(imovel)}</p>
              <p className="text-sm text-slate-600">
                {imovel.bairro ? `${imovel.bairro} – ` : ""}
                {imovel.cidade}/{imovel.estado}
              </p>
              <Link
                href={`/admin/imoveis/${imovel.id}`}
                className="mt-3 inline-block text-sm text-emerald-700 hover:underline"
              >
                Ver detalhes do imóvel →
              </Link>
            </>
          ) : (
            <p className="text-sm text-slate-500">Este inquilino não tem imóvel alugado no momento.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-medium text-slate-900">
            <FileText size={18} className="text-emerald-600" /> Contrato
          </h2>
          {contrato ? (
            <>
              <dl className="divide-y divide-slate-100">
                <Linha rotulo="Início">{formatDate(contrato.dataInicio)}</Linha>
                <Linha rotulo="Término">{formatDate(contrato.dataFim)}</Linha>
                {contrato.dataEntrada && <Linha rotulo="Entrada">{formatDate(contrato.dataEntrada)}</Linha>}
                <Linha rotulo="Valor do aluguel">{formatCurrency(contrato.valorAluguel)}</Linha>
                <Linha rotulo="Dia de vencimento">{contrato.diaVencimento}</Linha>
              </dl>
              <Link
                href={`/admin/contratos/${contrato.id}`}
                className="mt-3 inline-block text-sm text-emerald-700 hover:underline"
              >
                Ver contrato →
              </Link>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Nenhum contrato ativo.{" "}
              <Link
                href={`/admin/contratos/novo?inquilinoId=${inquilino.id}`}
                className="text-emerald-700 hover:underline"
              >
                Criar contrato
              </Link>
            </p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-medium text-slate-900">
            <Wallet size={18} className="text-emerald-600" /> Despesas
          </h2>
          {imovel ? (
            <dl className="divide-y divide-slate-100">
              <Linha rotulo="Água">{imovel.aguaInclusa ? "Inclusa no aluguel" : "Por conta do inquilino"}</Linha>
              <Linha rotulo="Energia">{imovel.energiaInclusa ? "Inclusa no aluguel" : "Por conta do inquilino"}</Linha>
              <Linha rotulo="IPTU">{imovel.iptuResponsavel === "LOCATARIO" ? "Inquilino" : "Proprietário"}</Linha>
              <Linha rotulo="Condomínio">
                {imovel.temCondominio
                  ? imovel.valorCondominio
                    ? formatCurrency(imovel.valorCondominio)
                    : "Sim"
                  : "Não se aplica"}
              </Linha>
            </dl>
          ) : (
            <p className="text-sm text-slate-500">Sem imóvel vinculado.</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-1 text-lg font-medium text-slate-900">Histórico de contratos</h2>
        <p className="mb-4 text-sm text-slate-500">Todos os imóveis que este inquilino já alugou.</p>
        {inquilino.contratos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum contrato registrado para este inquilino.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Imóvel</th>
                  <th className="py-2 pr-4">Início</th>
                  <th className="py-2 pr-4">Término</th>
                  <th className="py-2 pr-4">Aluguel</th>
                  <th className="py-2 pr-4">Situação</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquilino.contratos.map((c) => {
                  const st = STATUS_CONTRATO.find((s) => s.value === c.status);
                  return (
                    <tr key={c.id}>
                      <td className="py-2 pr-4">
                        <Link href={`/admin/imoveis/${c.imovelId}`} className="font-medium text-slate-900 hover:underline">
                          {c.imovel.titulo}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-slate-600">{formatDate(c.dataInicio)}</td>
                      <td className="py-2 pr-4 text-slate-600">{formatDate(c.dataFim)}</td>
                      <td className="py-2 pr-4 text-slate-600">{formatCurrency(c.valorAluguel)}</td>
                      <td className="py-2 pr-4">
                        <Badge color={st?.color}>{labelFor(STATUS_CONTRATO, c.status)}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <Link href={`/admin/contratos/${c.id}`} className="text-emerald-700 hover:underline">
                          Ver contrato
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <section id="editar" className="scroll-mt-6 max-w-xl space-y-8">
        <Card>
          <h2 className="mb-4 text-lg font-medium text-slate-900">Dados do inquilino</h2>
          <InquilinoForm inquilino={inquilino} action={updateWithId} />
        </Card>

        <Card className="border-red-200">
          <h2 className="mb-2 text-lg font-medium text-red-700">Excluir inquilino</h2>
          <BotaoExcluir
            acao={deleteInquilino.bind(null, inquilino.id)}
            redirecionarPara="/admin/inquilinos"
            confirmacao="Excluir este inquilino?"
            label="Excluir inquilino"
          />
        </Card>
      </section>
    </div>
  );
}
