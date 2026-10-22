"use server";

import { exigirAdmin } from "@/lib/auth/acesso";
import { registrarAuditoria } from "@/lib/seguranca/auditoria";
import { prisma } from "@/lib/db/prisma";
import { inquilinoSchema } from "@/lib/comum/validations";
import type { ResultadoAcao } from "@/lib/comum/acoes";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parse(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = inquilinoSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  return parsed.data;
}

export async function createInquilino(formData: FormData) {
  const admin = await exigirAdmin();
  const data = parse(formData);
  const criado = await prisma.inquilino.create({ data });
  await registrarAuditoria({ acao: "INQUILINO_CRIADO", userId: admin.id, email: admin.email, detalhe: criado.id });
  revalidatePath("/admin/inquilinos");
  redirect("/admin/inquilinos");
}

export async function updateInquilino(id: string, formData: FormData) {
  const admin = await exigirAdmin();
  const data = parse(formData);
  await prisma.inquilino.update({ where: { id }, data });
  await registrarAuditoria({ acao: "INQUILINO_ALTERADO", userId: admin.id, email: admin.email, detalhe: id });
  revalidatePath("/admin/inquilinos");
  redirect("/admin/inquilinos");
}

export async function deleteInquilino(id: string): Promise<ResultadoAcao> {
  const admin = await exigirAdmin();
  const contratosVinculados = await prisma.contrato.count({ where: { inquilinoId: id } });
  if (contratosVinculados > 0) {
    return {
      error:
        "Este inquilino tem contrato(s) vinculado(s). Exclua ou encerre os contratos antes de excluir o inquilino.",
    };
  }

  const imoveisVinculados = await prisma.imovel.count({ where: { inquilinoId: id } });
  if (imoveisVinculados > 0) {
    return {
      error:
        "Este inquilino está registrado em imóvel(is) alugado(s). Troque o inquilino desses imóveis antes de excluir.",
    };
  }

  await prisma.inquilino.delete({ where: { id } });
  await registrarAuditoria({ acao: "INQUILINO_EXCLUIDO", userId: admin.id, email: admin.email, detalhe: id });
  revalidatePath("/admin/inquilinos");
  return { ok: true };
}
