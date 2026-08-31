"use server";

import { prisma } from "@/lib/prisma";
import { inquilinoSchema } from "@/lib/validations";
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
  const data = parse(formData);
  await prisma.inquilino.create({ data });
  revalidatePath("/admin/inquilinos");
  redirect("/admin/inquilinos");
}

export async function updateInquilino(id: string, formData: FormData) {
  const data = parse(formData);
  await prisma.inquilino.update({ where: { id }, data });
  revalidatePath("/admin/inquilinos");
  redirect("/admin/inquilinos");
}

export async function deleteInquilino(formData: FormData) {
  const id = formData.get("id") as string;

  const contratosVinculados = await prisma.contrato.count({ where: { inquilinoId: id } });
  if (contratosVinculados > 0) {
    throw new Error("Este inquilino possui contratos vinculados e não pode ser excluído.");
  }

  await prisma.inquilino.delete({ where: { id } });
  revalidatePath("/admin/inquilinos");
  redirect("/admin/inquilinos");
}
