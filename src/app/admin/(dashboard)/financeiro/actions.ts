"use server";

import { prisma } from "@/lib/prisma";
import { pagamentoSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function marcarComoPago(formData: FormData) {
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

  revalidatePath("/admin/financeiro");
}

export async function updatePagamento(id: string, formData: FormData) {
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

  revalidatePath("/admin/financeiro");
  redirect("/admin/financeiro");
}
