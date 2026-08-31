-- AlterTable
ALTER TABLE "Contrato" ADD COLUMN "bensInclusos" TEXT;
ALTER TABLE "Contrato" ADD COLUMN "valorCaucao" REAL;

-- AlterTable
ALTER TABLE "Proprietario" ADD COLUMN "endereco" TEXT;
ALTER TABLE "Proprietario" ADD COLUMN "estadoCivil" TEXT;
ALTER TABLE "Proprietario" ADD COLUMN "nacionalidade" TEXT DEFAULT 'brasileiro(a)';
ALTER TABLE "Proprietario" ADD COLUMN "profissao" TEXT;
ALTER TABLE "Proprietario" ADD COLUMN "rg" TEXT;

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL DEFAULT 'Imobiliária',
    "cnpj" TEXT,
    "endereco" TEXT,
    "telefone" TEXT,
    "responsavelNome" TEXT,
    "responsavelCreci" TEXT,
    "chavePix" TEXT,
    "logoUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inquilino" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoPessoa" TEXT NOT NULL DEFAULT 'FISICA',
    "nome" TEXT NOT NULL,
    "cpfCnpj" TEXT,
    "rg" TEXT,
    "nacionalidade" TEXT DEFAULT 'brasileiro(a)',
    "estadoCivil" TEXT,
    "profissao" TEXT,
    "representanteLegalNome" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Inquilino" ("cpfCnpj", "createdAt", "email", "endereco", "id", "nome", "observacoes", "telefone", "updatedAt") SELECT "cpfCnpj", "createdAt", "email", "endereco", "id", "nome", "observacoes", "telefone", "updatedAt" FROM "Inquilino";
DROP TABLE "Inquilino";
ALTER TABLE "new_Inquilino" RENAME TO "Inquilino";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
