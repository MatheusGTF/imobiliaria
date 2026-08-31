/**
 * Importa prisma/data-export.json para o banco apontado pela DATABASE_URL atual.
 * Uso: npm run db:import
 *
 * Deve ser rodado depois de `prisma migrate deploy` no banco de destino.
 * A ordem de inserção respeita as chaves estrangeiras. Registros que já
 * existirem (mesmo id) são ignorados — o script pode rodar mais de uma vez.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

type Dump = {
  users: unknown[];
  empresa: unknown[];
  proprietarios: unknown[];
  inquilinos: unknown[];
  imoveis: unknown[];
  fotos: unknown[];
  contratos: unknown[];
  pagamentos: unknown[];
};

async function inserir<T extends { id: string }>(
  nome: string,
  linhas: T[],
  criar: (linha: T) => Promise<unknown>,
) {
  let ok = 0;
  let pulados = 0;
  for (const linha of linhas) {
    try {
      await criar(linha);
      ok++;
    } catch (e) {
      // P2002 = registro já existe (id duplicado) → ignora
      if ((e as { code?: string }).code === "P2002") pulados++;
      else throw e;
    }
  }
  console.log(`  ${nome}: ${ok} inseridos, ${pulados} já existiam`);
}

async function main() {
  const arquivo = path.join(__dirname, "data-export.json");
  const dump = JSON.parse(readFileSync(arquivo, "utf8")) as Dump;

  console.log(`Importando ${arquivo}...`);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  await inserir("users", dump.users as any[], (d) => prisma.user.create({ data: d }));
  await inserir("empresa", dump.empresa as any[], (d) => prisma.empresa.create({ data: d }));
  await inserir("proprietarios", dump.proprietarios as any[], (d) =>
    prisma.proprietario.create({ data: d }),
  );
  await inserir("inquilinos", dump.inquilinos as any[], (d) =>
    prisma.inquilino.create({ data: d }),
  );
  await inserir("imoveis", dump.imoveis as any[], (d) => prisma.imovel.create({ data: d }));
  await inserir("fotos", dump.fotos as any[], (d) => prisma.foto.create({ data: d }));
  await inserir("contratos", dump.contratos as any[], (d) => prisma.contrato.create({ data: d }));
  await inserir("pagamentos", dump.pagamentos as any[], (d) =>
    prisma.pagamento.create({ data: d }),
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  console.log("Importação concluída.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
