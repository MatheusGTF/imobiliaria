import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";

// Registro de atividade do painel (LGPD, art. 37 e 46: rastreabilidade e
// segurança). Guarda só identificadores — nunca nomes, CPF ou dados de clientes.
// Os registros são apagados automaticamente após 180 dias.

const DIAS_DE_RETENCAO = 180;

/** IP de quem fez a requisição. Na Vercel o cabeçalho é preenchido pela própria plataforma. */
export function ipDosCabecalhos(h: Headers): string | null {
  const encaminhado = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = encaminhado || h.get("x-real-ip")?.trim();
  return ip ? ip.slice(0, 64) : null;
}

export async function obterIp(): Promise<string | null> {
  try {
    return ipDosCabecalhos(await headers());
  } catch {
    return null; // fora de uma requisição (ex.: script)
  }
}

export async function registrarAuditoria(dados: {
  acao: string;
  userId?: string | null;
  email?: string | null;
  detalhe?: string | null;
  ip?: string | null;
}): Promise<void> {
  try {
    await prisma.logAuditoria.create({
      data: {
        acao: dados.acao,
        userId: dados.userId ?? null,
        email: dados.email?.toLowerCase() ?? null,
        detalhe: dados.detalhe?.slice(0, 300) ?? null,
        ip: dados.ip ?? (await obterIp()),
      },
    });
  } catch (erro) {
    // O registro nunca pode derrubar a operação principal.
    console.error("Falha ao registrar auditoria:", erro);
  }
}

export async function limparLogsAntigos(): Promise<void> {
  try {
    const limite = new Date(Date.now() - DIAS_DE_RETENCAO * 24 * 60 * 60 * 1000);
    await prisma.logAuditoria.deleteMany({ where: { createdAt: { lt: limite } } });
  } catch (erro) {
    console.error("Falha ao limpar auditoria antiga:", erro);
  }
}
