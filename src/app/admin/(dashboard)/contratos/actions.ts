"use server";

import { exigirAdmin } from "@/lib/auth/acesso";
import { registrarAuditoria } from "@/lib/seguranca/auditoria";
import { prisma } from "@/lib/db/prisma";
import { contratoSchema } from "@/lib/comum/validations";
import { gerarMesesReferencia, calcularDataVencimento } from "@/lib/financeiro/pagamentos";
import { revalidarPortal } from "@/lib/comum/revalidate";
import type { ResultadoAcao } from "@/lib/comum/acoes";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createContrato(formData: FormData) {
  const admin = await exigirAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = contratoSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  const dataInicio = new Date(data.dataInicio);
  const dataFim = new Date(data.dataFim);
  if (dataFim < dataInicio) {
    throw new Error("A data de término não pode ser anterior à data de início.");
  }

  const contrato = await prisma.contrato.create({
    data: {
      imovelId: data.imovelId,
      inquilinoId: data.inquilinoId,
      dataInicio,
      dataFim,
      dataEntrada: data.dataEntrada ? new Date(data.dataEntrada) : null,
      diaVencimento: data.diaVencimento!,
      valorAluguel: data.valorAluguel!,
      valorCondominio: data.valorCondominio,
      valorIptu: data.valorIptu,
      taxaAdministracaoPercentual: data.taxaAdministracaoPercentual,
      valorCaucao: data.valorCaucao,
      bensInclusos: data.bensInclusos,
      observacoes: data.observacoes,
    },
  });

  const valorDevido = data.valorAluguel! + (data.valorCondominio ?? 0) + (data.valorIptu ?? 0);
  const meses = gerarMesesReferencia(dataInicio, dataFim);

  await prisma.pagamento.createMany({
    data: meses.map((mesReferencia) => ({
      contratoId: contrato.id,
      mesReferencia,
      dataVencimento: calcularDataVencimento(mesReferencia, data.diaVencimento!),
      valorDevido,
      status: "PENDENTE",
    })),
  });

  await prisma.imovel.update({
    where: { id: data.imovelId },
    data: { status: "ALUGADO", inquilinoId: data.inquilinoId },
  });

  await registrarAuditoria({ acao: "CONTRATO_CRIADO", userId: admin.id, email: admin.email, detalhe: contrato.id });
  revalidatePath("/admin/contratos");
  revalidatePath("/admin/imoveis");
  revalidatePath(`/admin/imoveis/${data.imovelId}`);
  revalidatePath("/admin/inquilinos");
  revalidarPortal();
  redirect(`/admin/contratos/${contrato.id}/documento`);
}

/**
 * Encerra a locação e mantém o contrato (e as parcelas pagas) como histórico.
 * O imóvel só volta a "Disponível" se a saída do inquilino foi confirmada
 * (checkbox `liberarImovel`, marcado por padrão). Sem confirmar, o imóvel
 * segue "Alugado" até alguém liberá-lo na tela do imóvel.
 */
export async function encerrarContrato(formData: FormData) {
  const admin = await exigirAdmin();
  const id = formData.get("id") as string;
  const liberarImovel = formData.get("liberarImovel") === "on";

  const contrato = await prisma.contrato.findUnique({ where: { id } });
  if (!contrato) throw new Error("Contrato não encontrado.");

  await prisma.contrato.update({ where: { id }, data: { status: "ENCERRADO" } });

  await prisma.pagamento.updateMany({
    where: { contratoId: id, status: "PENDENTE" },
    data: { status: "CANCELADO" },
  });

  const outrosAtivos = await prisma.contrato.count({
    where: { imovelId: contrato.imovelId, status: "ATIVO", id: { not: id } },
  });
  if (outrosAtivos === 0 && liberarImovel) {
    await prisma.imovel.update({
      where: { id: contrato.imovelId },
      data: { status: "DISPONIVEL", inquilinoId: null },
    });
  }

  await registrarAuditoria({ acao: "CONTRATO_ENCERRADO", userId: admin.id, email: admin.email, detalhe: id });
  revalidatePath("/admin/contratos");
  revalidatePath(`/admin/contratos/${id}`);
  revalidatePath("/admin/imoveis");
  revalidatePath(`/admin/imoveis/${contrato.imovelId}`);
  revalidatePath("/admin/inquilinos");
  revalidarPortal();
}

/**
 * Exclui o contrato e todas as parcelas. Com parcelas pagas, só exclui se
 * `forcar` for true (confirmação explícita do usuário na tela), porque isso
 * apaga também o histórico de pagamentos.
 */
export async function deleteContrato(id: string, forcar = false): Promise<ResultadoAcao> {
  const admin = await exigirAdmin();
  const contrato = await prisma.contrato.findUnique({ where: { id } });
  if (!contrato) return { error: "Contrato não encontrado." };

  const pagamentosPagos = await prisma.pagamento.count({ where: { contratoId: id, status: "PAGO" } });
  if (pagamentosPagos > 0 && !forcar) {
    return {
      error:
        `Este contrato tem ${pagamentosPagos} parcela(s) marcada(s) como paga(s). ` +
        "Excluir apaga também esse histórico de pagamentos. " +
        "Para só tirar da lista de ativos mantendo o histórico, use \"Encerrar contrato\".",
      podeForcar: true,
    };
  }

  await prisma.pagamento.deleteMany({ where: { contratoId: id } });
  await prisma.contrato.delete({ where: { id } });
  await registrarAuditoria({ acao: "CONTRATO_EXCLUIDO", userId: admin.id, email: admin.email, detalhe: forcar ? `${id} (forçado)` : id });

  const outrosAtivos = await prisma.contrato.count({
    where: { imovelId: contrato.imovelId, status: "ATIVO" },
  });
  if (outrosAtivos === 0) {
    await prisma.imovel.update({
      where: { id: contrato.imovelId },
      data: { status: "DISPONIVEL", inquilinoId: null },
    });
  }

  revalidatePath("/admin/contratos");
  revalidatePath("/admin/imoveis");
  revalidarPortal();
  return { ok: true };
}
