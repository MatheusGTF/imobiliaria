import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Cria o primeiro administrador. Não existe senha padrão: e-mail e senha
// precisam ser informados por variável de ambiente (veja .env.example).
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD no .env antes de rodar o seed.");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("SEED_ADMIN_PASSWORD precisa ter pelo menos 12 caracteres.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Usuário admin já existe: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name: "Administrador", email, passwordHash, role: "ADMIN" },
  });

  console.log(`Usuário admin criado: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
