import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ImovelForm } from "../ImovelForm";
import { FotoManager } from "./FotoManager";
import { VendaManager } from "./VendaManager";
import { updateImovel, deleteImovel, liberarImovel } from "../actions";
import { BotaoExcluir } from "@/components/admin/BotaoExcluir";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { PrecoImovel } from "@/components/PrecoImovel";
import {
  STATUS_IMOVEL,
  STATUS_CONTRATO,
  TIPOS_IMOVEL,
  FINALIDADE_IMOVEL,
  aceitaAluguel,
  aceitaVenda,
  ehNaoResidencial,
  labelFor,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { avisoTermino } from "@/lib/avisos";
import { ruaENumero } from "@/lib/locacao";
import { Building2, MapPin, Pencil, FilePlus2, FileText, KeyRound } from "lucide-react";

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500">{rotulo}</dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export default async function ImovelDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [imovel, proprietarios, inquilinos] = await Promise.all([
    prisma.imovel.findUnique({
      where: { id },
      include: {
        fotos: { orderBy: { ordem: "asc" } },
        proprietario: true,
        inquilino: true,
        contratos: { orderBy: { dataInicio: "desc" }, include: { inquilino: true } },
      },
    }),
    prisma.proprietario.findMany({ orderBy: { nome: "asc" } }),
    prisma.inquilino.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!imovel) notFound();

  const updateWithId = updateImovel.bind(null, id);
  const status = STATUS_IMOVEL.find((s) => s.value === imovel.status);
  const capa = imovel.fotos.find((f) => f.capa) ?? imovel.fotos[0];
  const outrasFotos = imovel.fotos.filter((f) => f.id !== capa?.id);

  const locacaoAtual = imovel.contratos.find((c) => c.status === "ATIVO");
  const aviso = locacaoAtual ? avisoTermino(locacaoAtual.dataFim) : null;
  // Consta como alugado, mas sem contrato ativo (contrato encerrado sem confirmar
  // a saída, ou locação registrada à mão): oferece confirmar a saída.
  const alugadoSemContrato = imovel.status === "ALUGADO" && !locacaoAtual;

  const uso = ehNaoResidencial(imovel.tipo) ? "Comercial" : "Residencial";
  const caracteristicas = [
    imovel.quartos != null ? `${imovel.quartos} quarto(s)` : null,
    imovel.banheiros != null ? `${imovel.banheiros} banheiro(s)` : null,
    imovel.vagas != null ? `${imovel.vagas} vaga(s)` : null,
    imovel.areaM2 != null ? `${imovel.areaM2} m²` : null,
    imovel.mobiliado ? "Mobiliado" : null,
    imovel.aceitaPet ? "Aceita pets" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{imovel.titulo}</h1>
            <Badge color={status?.color}>{status?.label ?? imovel.status}</Badge>
          </div>
          <p className="text-sm text-slate-500">Visualizar e editar todas as informações do imóvel</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/imoveis" className="text-sm text-slate-500 hover:underline">
            Voltar para a lista
          </Link>
          <a href="#editar">
            <Button variant="secondary">
              <Pencil size={16} /> Editar imóvel
            </Button>
          </a>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 text-sm">
        {[
          ["#dados", "Dados do imóvel"],
          ["#locacao", "Locação atual"],
          ["#historico", "Histórico de locações"],
          ["#fotos", "Fotos"],
          ["#editar", "Editar dados"],
        ].map(([href, texto]) => (
          <a key={href} href={href} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200">
            {texto}
          </a>
        ))}
      </nav>

      {/* Dados do imóvel */}
      <section id="dados" className="scroll-mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-100">
              {capa ? (
                <Image src={capa.url} alt={imovel.titulo} fill className="object-cover" sizes="(min-width: 1024px) 600px, 100vw" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <Building2 size={48} />
                </div>
              )}
            </div>
            {outrasFotos.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {outrasFotos.slice(0, 4).map((f) => (
                  <div key={f.id} className="relative aspect-[4/3] overflow-hidden rounded bg-slate-100">
                    <Image src={f.url} alt="" fill className="object-cover" sizes="150px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Card className="lg:col-span-2">
            <p className="text-sm text-slate-500">
              {labelFor(TIPOS_IMOVEL, imovel.tipo)} {uso.toLowerCase()} · {labelFor(FINALIDADE_IMOVEL, imovel.finalidade)}
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-slate-700">
              <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
              <span>
                {ruaENumero(imovel)}
                <br />
                {imovel.bairro ? `${imovel.bairro} – ` : ""}
                {imovel.cidade}/{imovel.estado}
              </span>
            </p>
            <dl className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
              <Linha rotulo="Valor">
                <PrecoImovel imovel={imovel} className="text-sm font-semibold text-slate-900" />
              </Linha>
              <Linha rotulo="Tipo">{labelFor(TIPOS_IMOVEL, imovel.tipo)}</Linha>
              <Linha rotulo="Finalidade">{uso}</Linha>
              <Linha rotulo="Proprietário">
                {imovel.proprietario ? (
                  <Link href={`/admin/proprietarios/${imovel.proprietario.id}`} className="hover:underline">
                    {imovel.proprietario.nome}
                  </Link>
                ) : (
                  "-"
                )}
              </Linha>
              <Linha rotulo="Cadastrado em">{formatDate(imovel.createdAt)}</Linha>
              <Linha rotulo="Última atualização">{formatDate(imovel.updatedAt)}</Linha>
            </dl>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <h2 className="mb-2 font-medium text-slate-900">Descrição do imóvel</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-600">
              {imovel.descricao || "Sem descrição cadastrada."}
            </p>
          </Card>

          <Card>
            <h2 className="mb-2 font-medium text-slate-900">Características</h2>
            {caracteristicas.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma característica informada.</p>
            ) : (
              <ul className="space-y-1 text-sm text-slate-600">
                {caracteristicas.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-2 font-medium text-slate-900">Informações adicionais</h2>
            <dl className="divide-y divide-slate-100">
              <Linha rotulo="Água">{imovel.aguaInclusa ? "Inclusa no aluguel" : "Não inclusa"}</Linha>
              <Linha rotulo="Energia">{imovel.energiaInclusa ? "Inclusa no aluguel" : "Não inclusa"}</Linha>
              <Linha rotulo="IPTU">
                {imovel.iptuResponsavel === "LOCATARIO" ? "Inquilino" : "Proprietário"}
                {imovel.valorIptu ? ` · ${formatCurrency(imovel.valorIptu)}` : ""}
              </Linha>
              <Linha rotulo="Condomínio">
                {imovel.temCondominio
                  ? imovel.valorCondominio
                    ? formatCurrency(imovel.valorCondominio)
                    : "Sim"
                  : "Não se aplica"}
              </Linha>
              <Linha rotulo="Aceita pets">{imovel.aceitaPet ? "Sim" : "Não"}</Linha>
            </dl>
            {imovel.temCondominio && imovel.condominioDescricao && (
              <p className="mt-3 whitespace-pre-wrap border-t border-slate-100 pt-3 text-xs text-slate-500">
                {imovel.condominioDescricao}
              </p>
            )}
          </Card>
        </div>
      </section>

      {/* Locação atual */}
      <section id="locacao" className="scroll-mt-6">
        <Card className="border-emerald-200 bg-emerald-50/60">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-medium text-slate-900">
              <KeyRound size={18} className="text-emerald-700" /> Locação atual
            </h2>
            {aviso && <Badge color={aviso.cor}>{aviso.texto}</Badge>}
          </div>

          {locacaoAtual ? (
            <>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
                <div>
                  <dt className="text-slate-500">Inquilino</dt>
                  <dd className="font-medium text-slate-900">
                    <Link href={`/admin/inquilinos/${locacaoAtual.inquilinoId}`} className="hover:underline">
                      {locacaoAtual.inquilino.nome}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Início do contrato</dt>
                  <dd className="font-medium text-slate-900">{formatDate(locacaoAtual.dataInicio)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Término do contrato</dt>
                  <dd className="font-medium text-slate-900">{formatDate(locacaoAtual.dataFim)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Valor do aluguel</dt>
                  <dd className="font-medium text-slate-900">{formatCurrency(locacaoAtual.valorAluguel)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Dia de vencimento</dt>
                  <dd className="font-medium text-slate-900">{locacaoAtual.diaVencimento}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/admin/contratos/${locacaoAtual.id}`}>
                  <Button variant="secondary">Ver contrato</Button>
                </Link>
                <Link href={`/admin/contratos/${locacaoAtual.id}/documento`}>
                  <Button variant="secondary">
                    <FileText size={16} /> Gerar documento
                  </Button>
                </Link>
              </div>
            </>
          ) : alugadoSemContrato ? (
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                Este imóvel consta como <strong>Alugado</strong>
                {imovel.inquilino ? (
                  <>
                    {" "}
                    para <strong>{imovel.inquilino.nome}</strong>
                  </>
                ) : null}
                , mas não há contrato ativo no sistema. Se o inquilino já saiu, confirme a saída para deixar o
                imóvel disponível — o histórico de contratos é mantido.
              </p>
              <form action={liberarImovel}>
                <input type="hidden" name="id" value={imovel.id} />
                <ConfirmButton
                  variant="primary"
                  confirmMessage="Confirmar a saída do inquilino e deixar o imóvel como Disponível? O histórico de contratos é mantido."
                >
                  Confirmar saída e marcar como disponível
                </ConfirmButton>
              </form>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                {imovel.status === "DISPONIVEL"
                  ? "Nenhuma locação ativa. O imóvel está disponível."
                  : "Nenhuma locação ativa neste imóvel."}
              </p>
              {imovel.status === "DISPONIVEL" && aceitaAluguel(imovel.finalidade) && (
                <Link href={`/admin/contratos/novo?imovelId=${imovel.id}`}>
                  <Button>
                    <FilePlus2 size={16} /> Criar contrato de locação
                  </Button>
                </Link>
              )}
            </div>
          )}
        </Card>
      </section>

      {/* Histórico de locações */}
      <section id="historico" className="scroll-mt-6">
        <Card>
          <h2 className="mb-1 text-lg font-medium text-slate-900">Histórico de locações</h2>
          <p className="mb-4 text-sm text-slate-500">
            Quem já alugou este imóvel. Ao trocar de inquilino, o contrato anterior fica guardado aqui.
          </p>
          {imovel.contratos.length === 0 ? (
            <p className="text-sm text-slate-500">Este imóvel ainda não teve nenhuma locação registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">Inquilino</th>
                    <th className="py-2 pr-4">Início</th>
                    <th className="py-2 pr-4">Término</th>
                    <th className="py-2 pr-4">Aluguel</th>
                    <th className="py-2 pr-4">Situação</th>
                    <th className="py-2 pr-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {imovel.contratos.map((c) => {
                    const st = STATUS_CONTRATO.find((s) => s.value === c.status);
                    return (
                      <tr key={c.id}>
                        <td className="py-2 pr-4">
                          <Link href={`/admin/inquilinos/${c.inquilinoId}`} className="font-medium text-slate-900 hover:underline">
                            {c.inquilino.nome}
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
      </section>

      <section id="fotos" className="scroll-mt-6">
        <Card>
          <h2 className="mb-4 text-lg font-medium text-slate-900">Fotos</h2>
          <FotoManager imovelId={imovel.id} fotos={imovel.fotos} />
        </Card>
      </section>

      <section id="editar" className="scroll-mt-6 max-w-3xl">
        <Card>
          <h2 className="mb-4 text-lg font-medium text-slate-900">Editar dados do imóvel</h2>
          <ImovelForm
            imovel={imovel}
            proprietarios={proprietarios}
            inquilinos={inquilinos}
            action={updateWithId}
          />
        </Card>
      </section>

      {aceitaVenda(imovel.finalidade) && (
        <Card className="max-w-3xl">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Venda</h2>
          <VendaManager imovel={imovel} />
        </Card>
      )}

      <Card className="max-w-3xl border-red-200">
        <h2 className="mb-2 text-lg font-medium text-red-700">Excluir imóvel</h2>
        <p className="mb-4 text-sm text-slate-500">
          Remove o imóvel e suas fotos. Imóveis com contratos (inclusive encerrados) não podem ser excluídos,
          para não perder o histórico.
        </p>
        <BotaoExcluir
          acao={deleteImovel.bind(null, imovel.id)}
          redirecionarPara="/admin/imoveis"
          confirmacao="Excluir este imóvel e todas as suas fotos?"
          label="Excluir imóvel"
        />
      </Card>
    </div>
  );
}
