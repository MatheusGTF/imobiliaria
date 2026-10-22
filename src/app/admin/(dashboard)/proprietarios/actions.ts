"use server";

import { exigirAdmin } from "@/lib/auth/acesso";
import { registrarAuditoria } from "@/lib/seguranca/auditoria";
import { prisma } from "@/lib/db/prisma";
import { proprietarioSchema } from "@/lib/comum/validations";
import type { ResultadoAcao } from "@/lib/comum/acoes";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parse(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = proprietarioSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  return parsed.data;
}

export async function createProprietario(formData: FormData) {
  const admin = await exigirAdmin();
  const data = parse(formData);
  const criado = await prisma.proprietario.create({ data });
  await registrarAuditoria({ acao: "PROPRIETARIO_CRIADO", userId: admin.id, email: admin.email, detalhe: criado.id });
  revalidatePath("/admin/proprietarios");
  redirect("/admin/proprietarios");
}

export async function updateProprietario(id: string, formData: FormData) {
  const admin = await exigirAdmin();
  const data = parse(formData);
  await prisma.proprietario.update({ where: { id }, data });
  await registrarAuditoria({ acao: "PROPRIETARIO_ALTERADO", userId: admin.id, email: admin.email, detalhe: id });
  revalidatePath("/admin/proprietarios");
  redirect("/admin/proprietarios");
}

export async function deleteProprietario(id: string): Promise<ResultadoAcao> {
  const admin = await exigirAdmin();
  const imoveisVinculados = await prisma.imovel.count({ where: { proprietarioId: id } });
  if (imoveisVinculados > 0) {
    return {
      error:
        "Este proprietário tem imóvel(is) vinculado(s). Troque o proprietário desses imóveis antes de excluir.",
    };
  }

  await prisma.proprietario.delete({ where: { id } });
  await registrarAuditoria({ acao: "PROPRIETARIO_EXCLUIDO", userId: admin.id, email: admin.email, detalhe: id });
  revalidatePath("/admin/proprietarios");
  return { ok: true };
}
