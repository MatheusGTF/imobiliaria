import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { registrarAuditoria, limparLogsAntigos } from "@/lib/seguranca/auditoria";
import { decifrar } from "@/lib/seguranca/cripto";
import { consumirCodigo } from "@/lib/seguranca/codigosRecuperacao";
import { verificarTotp } from "@/lib/seguranca/totp";

// Verificação completa do login: limite de tentativas → senha → autenticador.
// É chamada pelo `authorize` do NextAuth, então vale para qualquer caminho de
// entrada (inclusive uma chamada direta a /api/auth/callback/credentials).

const JANELA_MS = 15 * 60 * 1000;
const MAX_FALHAS_POR_IP = 5; // em 15 min, de qualquer conta
const MAX_FALHAS_POR_CONTA = 30; // em 15 min, de qualquer IP (ataque distribuído)

export type ResultadoLogin =
  | { ok: true; user: Pick<User, "id" | "name" | "email" | "role"> }
  | { ok: false; motivo: "invalido" | "bloqueado" | "codigo_necessario" | "codigo_invalido" };

let hashFalso: string | undefined;
async function obterHashFalso() {
  // Comparar com um hash falso quando o e-mail não existe mantém o tempo de
  // resposta igual e não revela quais e-mails têm conta.
  hashFalso ??= await bcrypt.hash("senha-falsa-para-igualar-o-tempo", 12);
  return hashFalso;
}

/** Segundo fator: código de 6 dígitos do aplicativo OU um código de recuperação (uso único). */
export async function conferirSegundoFator(user: User, codigo: string, ip: string | null): Promise<boolean> {
  if (!user.totpSecret) return false;
  const digitado = codigo.trim();

  // 1) código de 6 dígitos do aplicativo
  if (/^\d{3}\s?\d{3}$/.test(digitado)) {
    const passo = verificarTotp(decifrar(user.totpSecret), digitado, user.totpUltimoPasso);
    if (passo === null) return false;
    // Atualização condicional: se outra requisição já usou este intervalo, falha.
    const r = await prisma.user.updateMany({
      where: { id: user.id, OR: [{ totpUltimoPasso: null }, { totpUltimoPasso: { lt: passo } }] },
      data: { totpUltimoPasso: passo },
    });
    return r.count === 1;
  }

  // 2) código de recuperação (uso único)
  const restantes = consumirCodigo(user.codigosRecuperacao, digitado);
  if (restantes === null) return false;
  const r = await prisma.user.updateMany({
    where: { id: user.id, codigosRecuperacao: user.codigosRecuperacao },
    data: { codigosRecuperacao: restantes },
  });
  if (r.count !== 1) return false;
  await registrarAuditoria({ acao: "CODIGO_RECUPERACAO_USADO", userId: user.id, email: user.email, ip });
  return true;
}

/**
 * Limite de tentativas erradas (senha ou código), nos últimos 15 minutos:
 * 5 vindas do mesmo IP ou 30 contra a mesma conta (ataque vindo de vários IPs).
 * Vale também para trocar senha e mexer no autenticador.
 */
export async function limiteExcedido(email: string, ip: string | null): Promise<boolean> {
  const desde = new Date(Date.now() - JANELA_MS);
  const [falhasIp, falhasConta] = await Promise.all([
    ip ? prisma.logAuditoria.count({ where: { acao: "LOGIN_FALHA", ip, createdAt: { gte: desde } } }) : 0,
    prisma.logAuditoria.count({
      where: { acao: "LOGIN_FALHA", email: email.toLowerCase(), createdAt: { gte: desde } },
    }),
  ]);
  return falhasIp >= MAX_FALHAS_POR_IP || falhasConta >= MAX_FALHAS_POR_CONTA;
}

export async function verificarLogin(entrada: {
  email: string;
  senha: string;
  codigo?: string;
  ip: string | null;
}): Promise<ResultadoLogin> {
  const email = entrada.email.trim().toLowerCase();
  const { senha, ip } = entrada;
  const codigo = entrada.codigo?.trim() ?? "";

  if (!email || !senha || email.length > 254 || senha.length > 200) return { ok: false, motivo: "invalido" };

  // 1) limite de tentativas
  if (await limiteExcedido(email, ip)) {
    await registrarAuditoria({ acao: "LOGIN_BLOQUEADO", email, ip });
    return { ok: false, motivo: "bloqueado" };
  }

  // 2) senha
  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  const senhaCorreta = await bcrypt.compare(senha, user?.passwordHash ?? (await obterHashFalso()));
  if (!user || !senhaCorreta) {
    await registrarAuditoria({ acao: "LOGIN_FALHA", email, ip, detalhe: "senha" });
    return { ok: false, motivo: "invalido" };
  }

  // 3) autenticador
  if (user.totpAtivo) {
    if (!codigo) return { ok: false, motivo: "codigo_necessario" };
    if (!(await conferirSegundoFator(user, codigo, ip))) {
      await registrarAuditoria({ acao: "LOGIN_FALHA", userId: user.id, email, ip, detalhe: "codigo" });
      return { ok: false, motivo: "codigo_invalido" };
    }
  }

  await registrarAuditoria({ acao: "LOGIN_OK", userId: user.id, email, ip });
  if (Math.random() < 0.1) await limparLogsAntigos(); // faxina de vez em quando
  return { ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
