/**
 * Recuperação de acesso ao painel (uso de emergência, direto no banco).
 *
 *   # desligar o autenticador de um usuário (perdeu o celular e os códigos):
 *   npx tsx prisma/scripts/redefinir-acesso.ts --email voce@exemplo.com --desativar-2fa
 *
 *   # definir uma nova senha (passada por variável de ambiente, não pela linha de comando):
 *   NOVA_SENHA="uma senha longa e forte" npx tsx prisma/scripts/redefinir-acesso.ts --email voce@exemplo.com
 *
 * Usa as variáveis do banco (POSTGRES_PRISMA_URL / DATABASE_URL_UNPOOLED) do ambiente atual.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function argumento(nome: string): string | undefined {
  const i = process.argv.indexOf(nome);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = argumento("--email")?.trim().toLowerCase();
  const desativar2fa = process.argv.includes("--desativar-2fa");
  const novaSenha = process.env.NOVA_SENHA;

  if (!email || (!desativar2fa && !novaSenha)) {
    console.error('Informe --email e, no mínimo, --desativar-2fa ou a variável NOVA_SENHA. Veja o topo deste arquivo.');
    process.exit(1);
  }

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (!user) {
    console.error("Usuário não encontrado.");
    process.exit(1);
  }

  const data: Record<string, unknown> = {};
  if (novaSenha) {
    if (novaSenha.length < 12) {
      console.error("A nova senha precisa ter pelo menos 12 caracteres.");
      process.exit(1);
    }
    data.passwordHash = await bcrypt.hash(novaSenha, 12);
  }
  if (desativar2fa) {
    Object.assign(data, { totpAtivo: false, totpSecret: null, totpUltimoPasso: null, codigosRecuperacao: null });
  }

  await prisma.user.update({ where: { id: user.id }, data });
  await prisma.logAuditoria.create({
    data: { acao: "ACESSO_REDEFINIDO_PELO_SERVIDOR", userId: user.id, email: user.email, detalhe: Object.keys(data).join(",") },
  });
  console.log(`Acesso atualizado para ${user.email}${novaSenha ? " (senha trocada)" : ""}${desativar2fa ? " (autenticador desligado)" : ""}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
