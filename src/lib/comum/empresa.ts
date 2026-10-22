import { prisma } from "@/lib/db/prisma";

// Linha única de configuração da imobiliária. O upsert num id fixo evita que
// requisições simultâneas (comum logo após um deploy) criem várias linhas
// "vazias" — o que aconteceria com um simples findFirst() ?? create().
export async function getEmpresa() {
  const existente = await prisma.empresa.findFirst();
  if (existente) return existente;

  return prisma.empresa.upsert({
    where: { id: "empresa" },
    create: { id: "empresa" },
    update: {},
  });
}
