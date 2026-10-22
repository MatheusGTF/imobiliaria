"use server";

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

export async function deleteInquilino(id: string): Promise<ResultadoAcao> {
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
  revalidatePath("/admin/inquilinos");
  return { ok: true };
}
