-- Autenticador em duas etapas (TOTP) no usuário
ALTER TABLE "User" ADD COLUMN "totpSecret" TEXT;
ALTER TABLE "User" ADD COLUMN "totpAtivo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "totpUltimoPasso" INTEGER;
ALTER TABLE "User" ADD COLUMN "codigosRecuperacao" TEXT;

-- Registro de segurança/atividade do painel
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "acao" TEXT NOT NULL,
    "detalhe" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LogAuditoria_createdAt_idx" ON "LogAuditoria"("createdAt");
CREATE INDEX "LogAuditoria_acao_ip_createdAt_idx" ON "LogAuditoria"("acao", "ip", "createdAt");
CREATE INDEX "LogAuditoria_acao_email_createdAt_idx" ON "LogAuditoria"("acao", "email", "createdAt");

-- Canal de privacidade (LGPD) da imobiliária
ALTER TABLE "Empresa" ADD COLUMN "emailPrivacidade" TEXT;
ALTER TABLE "Empresa" ADD COLUMN "encarregadoNome" TEXT;
