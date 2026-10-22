import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export type Admin = { id: string; email: string; name: string };

/**
 * Garante que quem está chamando é um administrador logado. DEVE ser a primeira
 * linha de toda ação do painel ("use server") e de páginas que mostram dados
 * sensíveis: a proteção do proxy.ts não vale para as ações, que podem ser
 * chamadas diretamente (veja docs/SEGURANCA.md).
 *
 * Confere também no banco: se o usuário foi removido, a sessão deixa de valer
 * na hora, sem esperar o login expirar.
 */
export async function exigirAdmin(): Promise<Admin> {
  const sessao = await auth();
  const id = sessao?.user?.id;
  if (!id) redirect("/admin/login");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
  // Sessão válida, mas sem usuário correspondente: limpa a sessão (evita laço de redirecionamentos).
  if (!user || user.role !== "ADMIN") redirect("/admin/sair");

  return { id: user.id, email: user.email, name: user.name };
}
