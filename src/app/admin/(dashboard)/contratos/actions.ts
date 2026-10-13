"use server";

import { prisma } from "@/lib/prisma";
import { contratoSchema } from "@/lib/validations";
import { gerarMesesReferencia, calcularDataVencimento } from "@/lib/pagamentos";
import { revalidarPortal } from "@/lib/revalidate";
import type { ResultadoAcao } from "@/lib/acoes";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createContrato(formData: FormData) {
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

  await prisma.imovel.update({ where: { id: data.imovelId }, data: { status: "ALUGADO" } });

  revalidatePath("/admin/contratos");
  revalidatePath("/admin/imoveis");
  revalidarPortal();
  redirect(`/admin/contratos/${contrato.id}/documento`);
}

export async function encerrarContrato(formData: FormData) {
  const id = formData.get("id") as string;

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
  if (outrosAtivos === 0) {
    await prisma.imovel.update({ where: { id: contrato.imovelId }, data: { status: "DISPONIVEL" } });
  }

  revalidatePath("/admin/contratos");
  revalidatePath(`/admin/contratos/${id}`);
  revalidatePath("/admin/imoveis");
  revalidarPortal();
}

/**
 * Exclui o contrato e todas as parcelas. Com parcelas pagas, só exclui se
 * `forcar` for true (confirmação explícita do usuário na tela), porque isso
 * apaga também o histórico de pagamentos.
 */
export async function deleteContrato(id: string, forcar = false): Promise<ResultadoAcao> {
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

  const outrosAtivos = await prisma.contrato.count({
    where: { imovelId: contrato.imovelId, status: "ATIVO" },
  });
  if (outrosAtivos === 0) {
    await prisma.imovel.update({ where: { id: contrato.imovelId }, data: { status: "DISPONIVEL" } });
  }

  revalidatePath("/admin/contratos");
  revalidatePath("/admin/imoveis");
  revalidarPortal();
  return { ok: true };
}
