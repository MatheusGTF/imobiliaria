"use server";

import { exigirAdmin } from "@/lib/auth/acesso";
import { registrarAuditoria } from "@/lib/seguranca/auditoria";
import { prisma } from "@/lib/db/prisma";
import { pagamentoSchema } from "@/lib/comum/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function marcarComoPago(formData: FormData) {
  const admin = await exigirAdmin();
  const id = formData.get("id") as string;

  const pagamento = await prisma.pagamento.findUnique({ where: { id } });
  if (!pagamento) throw new Error("Pagamento não encontrado.");

  await prisma.pagamento.update({
    where: { id },
    data: {
      status: "PAGO",
      valorPago: pagamento.valorDevido,
      dataPagamento: new Date(),
    },
  });
  await registrarAuditoria({ acao: "PAGAMENTO_MARCADO_PAGO", userId: admin.id, email: admin.email, detalhe: id });

  revalidatePath("/admin/financeiro");
}

export async function updatePagamento(id: string, formData: FormData) {
  const admin = await exigirAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = pagamentoSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  await prisma.pagamento.update({
    where: { id },
    data: {
      status: data.status,
      valorPago: data.valorPago,
      dataPagamento: data.dataPagamento ? new Date(data.dataPagamento) : null,
      formaPagamento: data.formaPagamento,
      observacoes: data.observacoes,
    },
  });
  await registrarAuditoria({ acao: "PAGAMENTO_ALTERADO", userId: admin.id, email: admin.email, detalhe: id });

  revalidatePath("/admin/financeiro");
  redirect("/admin/financeiro");
}
