"use server";

import { prisma } from "@/lib/prisma";
import { proprietarioSchema } from "@/lib/validations";
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

export async function deleteProprietario(formData: FormData) {
  const id = formData.get("id") as string;

  const imoveisVinculados = await prisma.imovel.count({ where: { proprietarioId: id } });
  if (imoveisVinculados > 0) {
    throw new Error("Este proprietário possui imóveis vinculados e não pode ser excluído.");
  }

  await prisma.proprietario.delete({ where: { id } });
  revalidatePath("/admin/proprietarios");
  redirect("/admin/proprietarios");
}
