"use server";

import { prisma } from "@/lib/db/prisma";
import { imovelSchema, vendaSchema } from "@/lib/comum/validations";
import { saveUploadedPhoto, deletePhotoFile } from "@/lib/midia/photos";
import { aceitaAluguel, aceitaVenda } from "@/lib/comum/constants";
import { revalidarPortal } from "@/lib/comum/revalidate";
import type { ResultadoAcao } from "@/lib/comum/acoes";
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
    // Valor e descrição do condomínio só valem quando há condomínio.
    valorCondominio: data.temCondominio ? data.valorCondominio : null,
    condominioDescricao: data.temCondominio ? data.condominioDescricao || null : null,
    proprietarioId: data.proprietarioId || null,
    // O inquilino só faz sentido enquanto o imóvel está alugado.
    inquilinoId: data.status === "ALUGADO" ? data.inquilinoId || null : null,
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

/**
 * Confirma a saída do inquilino: o imóvel volta a "Disponível" e o inquilino
 * atual é desvinculado. O histórico de contratos não é tocado. Se ainda houver
 * contrato ativo, não faz nada (o contrato precisa ser encerrado antes).
 */
export async function liberarImovel(formData: FormData) {
  const id = formData.get("id") as string;

  const ativos = await prisma.contrato.count({ where: { imovelId: id, status: "ATIVO" } });
  if (ativos === 0) {
    await prisma.imovel.update({ where: { id }, data: { status: "DISPONIVEL", inquilinoId: null } });
  }

  revalidatePath("/admin/imoveis");
  revalidatePath(`/admin/imoveis/${id}`);
  revalidatePath("/admin/inquilinos");
  revalidarPortal();
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

/**
 * Grava a ordem das fotos exatamente como a pessoa deixou na tela. A primeira
 * foto da lista é sempre a capa (`capa`), então escolher a capa e ordenar são a
 * mesma coisa: quem fica em primeiro aparece no portal e nos cards.
 */
export async function reordenarFotos(imovelId: string, idsEmOrdem: string[]): Promise<ResultadoAcao> {
  try {
    const existentes = await prisma.foto.findMany({
      where: { imovelId },
      orderBy: { ordem: "asc" },
      select: { id: true },
    });
    const validos = new Set(existentes.map((f) => f.id));

    // Ignora ids que não são deste imóvel; fotos que ficaram de fora (ex.:
    // enviadas em outra aba) vão para o fim, sem perder nenhuma.
    const pedidos = idsEmOrdem.filter((id, i) => validos.has(id) && idsEmOrdem.indexOf(id) === i);
    const restantes = existentes.map((f) => f.id).filter((id) => !pedidos.includes(id));
    const ordemFinal = [...pedidos, ...restantes];

    await prisma.$transaction(
      ordemFinal.map((id, index) =>
        prisma.foto.update({ where: { id }, data: { ordem: index, capa: index === 0 } }),
      ),
    );

    revalidatePath(`/admin/imoveis/${imovelId}`);
    revalidatePath("/admin/imoveis");
    revalidarPortal();
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message || "Não foi possível salvar a ordem das fotos." };
  }
}
