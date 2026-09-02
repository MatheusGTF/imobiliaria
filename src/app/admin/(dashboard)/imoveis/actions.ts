"use server";

import { prisma } from "@/lib/prisma";
import { imovelSchema, vendaSchema } from "@/lib/validations";
import { saveUploadedPhoto, deletePhotoFile } from "@/lib/photos";
import { aceitaAluguel, aceitaVenda } from "@/lib/constants";
import { revalidarPortal } from "@/lib/revalidate";
import type { ResultadoAcao } from "@/lib/acoes";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseImovelForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = imovelSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  return {
    ...data,
    valorAluguel: aceitaAluguel(data.finalidade) ? data.valorAluguel : null,
    valorVenda: aceitaVenda(data.finalidade) ? data.valorVenda : null,
    destaque: !!data.destaque,
    mobiliado: !!data.mobiliado,
    aceitaPet: !!data.aceitaPet,
    proprietarioId: data.proprietarioId || null,
  };
}

export async function createImovel(formData: FormData) {
  const data = parseImovelForm(formData);

  const imovel = await prisma.imovel.create({ data });

  revalidatePath("/admin/imoveis");
  revalidarPortal();
  redirect(`/admin/imoveis/${imovel.id}`);
}

export async function updateImovel(id: string, formData: FormData) {
  const data = parseImovelForm(formData);

  await prisma.imovel.update({ where: { id }, data });

  revalidatePath("/admin/imoveis");
  revalidarPortal();
  revalidatePath(`/admin/imoveis/${id}`);
}

export async function marcarVendido(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = vendaSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  await prisma.imovel.update({
    where: { id },
    data: {
      status: "VENDIDO",
      dataVenda: new Date(data.dataVenda),
      valorVendaFinal: data.valorVendaFinal,
      compradorNome: data.compradorNome,
      compradorContato: data.compradorContato,
    },
  });

  revalidatePath("/admin/imoveis");
  revalidarPortal();
  revalidatePath(`/admin/imoveis/${id}`);
}

export async function reabrirAnuncio(formData: FormData) {
  const id = formData.get("id") as string;

  await prisma.imovel.update({
    where: { id },
    data: {
      status: "DISPONIVEL",
      dataVenda: null,
      valorVendaFinal: null,
      compradorNome: null,
      compradorContato: null,
    },
  });

  revalidatePath("/admin/imoveis");
  revalidarPortal();
  revalidatePath(`/admin/imoveis/${id}`);
}

export async function deleteImovel(id: string): Promise<ResultadoAcao> {
  const contratosVinculados = await prisma.contrato.count({ where: { imovelId: id } });
  if (contratosVinculados > 0) {
    return {
      error:
        "Este imóvel tem contrato(s) vinculado(s). Exclua ou encerre os contratos antes de excluir o imóvel.",
    };
  }

  const fotos = await prisma.foto.findMany({ where: { imovelId: id } });
  await Promise.all(fotos.map((f) => deletePhotoFile(f.url)));

  await prisma.imovel.delete({ where: { id } });

  revalidatePath("/admin/imoveis");
  revalidarPortal();
  return { ok: true };
}

/**
 * Adiciona UMA foto ao imóvel. O navegador já redimensionou/converteu para
 * .webp antes de enviar (ver src/components/admin/UploadFotos.tsx), então o
 * arquivo que chega aqui é pequeno. É chamada uma vez por foto.
 */
export async function adicionarFoto(
  imovelId: string,
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  try {
    const file = formData.get("foto") as File | null;
    if (!file || file.size === 0) return { error: "Arquivo vazio." };

    const url = await saveUploadedPhoto(file);
    const count = await prisma.foto.count({ where: { imovelId } });

    await prisma.foto.create({
      data: { imovelId, url, ordem: count, capa: count === 0 },
    });

    revalidatePath(`/admin/imoveis/${imovelId}`);
    revalidarPortal();
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message || "Falha ao enviar a foto." };
  }
}

export async function deleteFoto(formData: FormData) {
  const id = formData.get("id") as string;
  const imovelId = formData.get("imovelId") as string;

  const foto = await prisma.foto.findUnique({ where: { id } });
  if (foto) {
    await deletePhotoFile(foto.url);
    await prisma.foto.delete({ where: { id } });

    if (foto.capa) {
      const proxima = await prisma.foto.findFirst({
        where: { imovelId },
        orderBy: { ordem: "asc" },
      });
      if (proxima) {
        await prisma.foto.update({ where: { id: proxima.id }, data: { capa: true } });
      }
    }
  }

  revalidatePath(`/admin/imoveis/${imovelId}`);
  revalidarPortal();
}

export async function setFotoCapa(formData: FormData) {
  const id = formData.get("id") as string;
  const imovelId = formData.get("imovelId") as string;

  await prisma.foto.updateMany({ where: { imovelId }, data: { capa: false } });
  await prisma.foto.update({ where: { id }, data: { capa: true } });

  revalidatePath(`/admin/imoveis/${imovelId}`);
  revalidarPortal();
}

export async function moveFoto(formData: FormData) {
  const id = formData.get("id") as string;
  const imovelId = formData.get("imovelId") as string;
  const direction = formData.get("direction") as "up" | "down";

  const fotos = await prisma.foto.findMany({ where: { imovelId }, orderBy: { ordem: "asc" } });
  const index = fotos.findIndex((f) => f.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= fotos.length) return;

  const a = fotos[index];
  const b = fotos[swapIndex];

  await prisma.$transaction([
    prisma.foto.update({ where: { id: a.id }, data: { ordem: b.ordem } }),
    prisma.foto.update({ where: { id: b.id }, data: { ordem: a.ordem } }),
  ]);

  revalidatePath(`/admin/imoveis/${imovelId}`);
  revalidarPortal();
}
