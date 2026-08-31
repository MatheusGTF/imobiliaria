-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Imovel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "finalidade" TEXT NOT NULL DEFAULT 'ALUGUEL',
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "valorAluguel" REAL,
    "valorVenda" REAL,
    "valorCondominio" REAL,
    "valorIptu" REAL,
    "areaM2" REAL,
    "quartos" INTEGER,
    "banheiros" INTEGER,
    "vagas" INTEGER,
    "mobiliado" BOOLEAN NOT NULL DEFAULT false,
    "aceitaPet" BOOLEAN NOT NULL DEFAULT false,
    "dataVenda" DATETIME,
    "valorVendaFinal" REAL,
    "compradorNome" TEXT,
    "compradorContato" TEXT,
    "proprietarioId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Imovel_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Imovel" ("aceitaPet", "areaM2", "bairro", "banheiros", "cep", "cidade", "complemento", "createdAt", "descricao", "destaque", "estado", "id", "logradouro", "mobiliado", "numero", "proprietarioId", "quartos", "status", "tipo", "titulo", "updatedAt", "vagas", "valorAluguel", "valorCondominio", "valorIptu") SELECT "aceitaPet", "areaM2", "bairro", "banheiros", "cep", "cidade", "complemento", "createdAt", "descricao", "destaque", "estado", "id", "logradouro", "mobiliado", "numero", "proprietarioId", "quartos", "status", "tipo", "titulo", "updatedAt", "vagas", "valorAluguel", "valorCondominio", "valorIptu" FROM "Imovel";
DROP TABLE "Imovel";
ALTER TABLE "new_Imovel" RENAME TO "Imovel";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
