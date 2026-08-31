-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proprietario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpfCnpj" TEXT,
    "rg" TEXT,
    "nacionalidade" TEXT DEFAULT 'brasileiro(a)',
    "estadoCivil" TEXT,
    "profissao" TEXT,
    "endereco" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proprietario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquilino" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquilino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT 'Imobiliária',
    "razaoSocial" TEXT,
    "cnpj" TEXT,
    "endereco" TEXT,
    "telefone" TEXT,
    "telefone2" TEXT,
    "instagram" TEXT,
    "responsavelNome" TEXT,
    "responsavelCreci" TEXT,
    "responsavel2Nome" TEXT,
    "responsavel2Creci" TEXT,
    "chavePix" TEXT,
    "logoUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imovel" (
    "id" TEXT NOT NULL,
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
    "valorAluguel" DOUBLE PRECISION,
    "valorVenda" DOUBLE PRECISION,
    "valorCondominio" DOUBLE PRECISION,
    "valorIptu" DOUBLE PRECISION,
    "areaM2" DOUBLE PRECISION,
    "quartos" INTEGER,
    "banheiros" INTEGER,
    "vagas" INTEGER,
    "mobiliado" BOOLEAN NOT NULL DEFAULT false,
    "aceitaPet" BOOLEAN NOT NULL DEFAULT false,
    "dataVenda" TIMESTAMP(3),
    "valorVendaFinal" DOUBLE PRECISION,
    "compradorNome" TEXT,
    "compradorContato" TEXT,
    "proprietarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "capa" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "inquilinoId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "valorAluguel" DOUBLE PRECISION NOT NULL,
    "valorCondominio" DOUBLE PRECISION,
    "valorIptu" DOUBLE PRECISION,
    "taxaAdministracaoPercentual" DOUBLE PRECISION,
    "valorCaucao" DOUBLE PRECISION,
    "bensInclusos" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "mesReferencia" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valorDevido" DOUBLE PRECISION NOT NULL,
    "valorPago" DOUBLE PRECISION,
    "dataPagamento" TIMESTAMP(3),
    "formaPagamento" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_contratoId_mesReferencia_key" ON "Pagamento"("contratoId", "mesReferencia");

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

