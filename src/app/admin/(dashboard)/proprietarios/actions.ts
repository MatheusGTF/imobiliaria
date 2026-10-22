"use server";

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
  const data = parse(formData);
  await prisma.proprietario.create({ data });
  revalidatePath("/admin/proprietarios");
  redirect("/admin/proprietarios");
}

export async function updateProprietario(id: string, formData: FormData) {
  const data = parse(formData);
  await prisma.proprietario.update({ where: { id }, data });
  revalidatePath("/admin/proprietarios");
  redirect("/admin/proprietarios");
}

export async function deleteProprietario(id: string): Promise<ResultadoAcao> {
  const imoveisVinculados = await prisma.imovel.count({ where: { proprietarioId: id } });
  if (imoveisVinculados > 0) {
    return {
      error:
        "Este proprietário tem imóvel(is) vinculado(s). Troque o proprietário desses imóveis antes de excluir.",
    };
  }

  await prisma.proprietario.delete({ where: { id } });
  revalidatePath("/admin/proprietarios");
  return { ok: true };
}
