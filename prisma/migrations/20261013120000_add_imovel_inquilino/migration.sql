-- AlterTable
ALTER TABLE "Imovel" ADD COLUMN "inquilinoId" TEXT;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Preenche o inquilino dos imóveis que já têm contrato ativo
UPDATE "Imovel" i
SET "inquilinoId" = c."inquilinoId"
FROM "Contrato" c
WHERE c."imovelId" = i."id" AND c."status" = 'ATIVO' AND i."status" = 'ALUGADO';
