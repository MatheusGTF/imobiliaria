import { prisma } from "@/lib/prisma";

export async function getEmpresa() {
  const empresa = await prisma.empresa.findFirst();
  if (empresa) return empresa;
  return prisma.empresa.create({ data: {} });
}
