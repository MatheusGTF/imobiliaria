/**
 * Exporta todo o conteúdo do banco atual para prisma/data-export.json.
 * Uso: npm run db:export   (lê a DATABASE_URL do .env atual)
 *
 * Serve para levar os dados do SQLite local para o Postgres de produção:
 *   1. npm run db:export            (com o .env apontando pro SQLite)
 *   2. troca DATABASE_URL pro Postgres e roda as migrations
 *   3. npm run db:import            (insere o JSON no Postgres)
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const dump = {
    users: await prisma.user.findMany(),
    empresa: await prisma.empresa.findMany(),
    proprietarios: await prisma.proprietario.findMany(),
    inquilinos: await prisma.inquilino.findMany(),
    imoveis: await prisma.imovel.findMany(),
    fotos: await prisma.foto.findMany(),
    contratos: await prisma.contrato.findMany(),
    pagamentos: await prisma.pagamento.findMany(),
  };

  const destino = path.join(__dirname, "..", "data-export.json");
  writeFileSync(destino, JSON.stringify(dump, null, 2));

  const total = Object.values(dump).reduce((s, arr) => s + arr.length, 0);
  console.log(`Exportado ${total} registros para ${destino}`);
  for (const [tabela, arr] of Object.entries(dump)) {
    console.log(`  ${tabela}: ${arr.length}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
