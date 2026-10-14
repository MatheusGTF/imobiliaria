-- AlterTable
ALTER TABLE "Imovel" ADD COLUMN "aguaInclusa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "energiaInclusa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "temCondominio" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "condominioDescricao" TEXT;

-- Imóveis que já tinham valor de condomínio passam a constar como "com condomínio"
UPDATE "Imovel" SET "temCondominio" = true WHERE "valorCondominio" IS NOT NULL AND "valorCondominio" > 0;
