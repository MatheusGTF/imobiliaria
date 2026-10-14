-- AlterTable
ALTER TABLE "Imovel" ADD COLUMN "iptuResponsavel" TEXT NOT NULL DEFAULT 'PROPRIETARIO';

-- AlterTable
ALTER TABLE "Contrato" ADD COLUMN "dataEntrada" TIMESTAMP(3);
