"use server";

import { exigirAdmin } from "@/lib/auth/acesso";
import { registrarAuditoria } from "@/lib/seguranca/auditoria";
import { prisma } from "@/lib/db/prisma";
import { empresaSchema } from "@/lib/comum/validations";
import { getEmpresa } from "@/lib/comum/empresa";
import { saveUploadedPhoto, deletePhotoFile } from "@/lib/midia/photos";
import { revalidatePath } from "next/cache";

export async function updateEmpresa(formData: FormData) {
  const admin = await exigirAdmin();
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
  await registrarAuditoria({ acao: "CONFIGURACOES_ALTERADAS", userId: admin.id, email: admin.email, detalhe: null });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
}

/** Recebe a logo já redimensionada (.webp pequeno) do navegador. */
export async function salvarLogo(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  await exigirAdmin();
  try {
    const file = formData.get("logo") as File | null;
    if (!file || file.size === 0) return { error: "Nenhum arquivo selecionado." };

    const empresa = await getEmpresa();
    if (empresa.logoUrl) await deletePhotoFile(empresa.logoUrl);

    const url = await saveUploadedPhoto(file);
    await prisma.empresa.update({ where: { id: empresa.id }, data: { logoUrl: url } });

    revalidatePath("/admin/configuracoes");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message || "Falha ao enviar a logo." };
  }
}

export async function removerLogo() {
  await exigirAdmin();
  const empresa = await getEmpresa();
  if (empresa.logoUrl) await deletePhotoFile(empresa.logoUrl);

  await prisma.empresa.update({ where: { id: empresa.id }, data: { logoUrl: null } });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
}
