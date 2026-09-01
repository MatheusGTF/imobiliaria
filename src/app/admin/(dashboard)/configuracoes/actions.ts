"use server";

import { prisma } from "@/lib/prisma";
import { empresaSchema } from "@/lib/validations";
import { getEmpresa } from "@/lib/empresa";
import { saveUploadedPhoto, deletePhotoFile } from "@/lib/photos";
import { revalidatePath } from "next/cache";

export async function updateEmpresa(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = empresaSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const empresa = await getEmpresa();
  await prisma.empresa.update({
    where: { id: empresa.id },
    data: parsed.data,
  });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
}

/** Recebe a logo já redimensionada (.webp pequeno) do navegador. */
export async function salvarLogo(formData: FormData) {
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return;

  const empresa = await getEmpresa();
  if (empresa.logoUrl) await deletePhotoFile(empresa.logoUrl);

  const url = await saveUploadedPhoto(file);
  await prisma.empresa.update({ where: { id: empresa.id }, data: { logoUrl: url } });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
}

export async function removerLogo() {
  const empresa = await getEmpresa();
  if (empresa.logoUrl) await deletePhotoFile(empresa.logoUrl);

  await prisma.empresa.update({ where: { id: empresa.id }, data: { logoUrl: null } });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
}
