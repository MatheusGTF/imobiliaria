"use server";

import bcrypt from "bcryptjs";
import qrcode from "qrcode-generator";
import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/auth/acesso";
import { prisma } from "@/lib/db/prisma";
import { cifrar, decifrar } from "@/lib/seguranca/cripto";
import { conferirSegundoFator, limiteExcedido } from "@/lib/seguranca/login";
import { obterIp, registrarAuditoria } from "@/lib/seguranca/auditoria";
import { gerarCodigos, hashesDosCodigos } from "@/lib/seguranca/codigosRecuperacao";
import { hashSenha, validarSenhaNova } from "@/lib/seguranca/senha";
import { gerarSegredoBase32, uriOtpauth, verificarTotp } from "@/lib/seguranca/totp";

// Todas as ações desta tela exigem administrador logado (exigirAdmin) e, quando
// mexem em acesso, a SENHA ATUAL — assim uma sessão esquecida aberta não basta
// para trocar a senha ou desligar o autenticador.

export type EstadoSimples = { ok?: boolean; erro?: string; mensagem?: string } | undefined;
export type EstadoAtivacao = { erro?: string; codigos?: string[] } | undefined;
export type DadosQr = { qr: string; segredo: string } | { erro: string };

const BLOQUEIO = "Muitas tentativas erradas. Aguarde 15 minutos e tente de novo.";

/** Confere a senha atual respeitando o limite de tentativas; devolve o usuário ou uma mensagem de erro. */
async function conferirSenhaAtual(adminId: string, email: string, senha: string, motivo: string) {
  const ip = await obterIp();
  if (await limiteExcedido(email, ip)) return { erro: BLOQUEIO } as const;

  const user = await prisma.user.findUnique({ where: { id: adminId } });
  if (!user || !(await bcrypt.compare(senha, user.passwordHash))) {
    await registrarAuditoria({ acao: "LOGIN_FALHA", userId: adminId, email, ip, detalhe: motivo });
    return { erro: "A senha atual não confere." } as const;
  }
  return { user } as const;
}

export async function alterarSenha(_estado: EstadoSimples, formData: FormData): Promise<EstadoSimples> {
  const admin = await exigirAdmin();
  const atual = String(formData.get("senhaAtual") ?? "");
  const nova = String(formData.get("novaSenha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  const conferencia = await conferirSenhaAtual(admin.id, admin.email, atual, "alterar senha");
  if ("erro" in conferencia) return { erro: conferencia.erro };

  if (nova !== confirmacao) return { erro: "A confirmação não é igual à nova senha." };
  const problema = validarSenhaNova(nova, admin.email);
  if (problema) return { erro: problema };
  if (await bcrypt.compare(nova, conferencia.user.passwordHash)) {
    return { erro: "A nova senha precisa ser diferente da atual." };
  }

  await prisma.user.update({ where: { id: admin.id }, data: { passwordHash: await hashSenha(nova) } });
  await registrarAuditoria({ acao: "SENHA_ALTERADA", userId: admin.id, email: admin.email });
  revalidatePath("/admin/seguranca");
  return { ok: true, mensagem: "Senha alterada com sucesso." };
}

export async function alterarEmail(_estado: EstadoSimples, formData: FormData): Promise<EstadoSimples> {
  const admin = await exigirAdmin();
  const atual = String(formData.get("senhaAtual") ?? "");
  const novo = String(formData.get("novoEmail") ?? "")
    .trim()
    .toLowerCase();

  const conferencia = await conferirSenhaAtual(admin.id, admin.email, atual, "alterar e-mail");
  if ("erro" in conferencia) return { erro: conferencia.erro };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(novo) || novo.length > 254) {
    return { erro: "Informe um e-mail válido." };
  }
  if (novo === admin.email.toLowerCase()) return { erro: "Esse já é o seu e-mail de acesso." };

  const existente = await prisma.user.findFirst({ where: { email: { equals: novo, mode: "insensitive" } } });
  if (existente) return { erro: "Não foi possível usar esse e-mail." };

  await prisma.user.update({ where: { id: admin.id }, data: { email: novo } });
  await registrarAuditoria({ acao: "EMAIL_ALTERADO", userId: admin.id, email: novo });
  revalidatePath("/admin/seguranca");
  return { ok: true, mensagem: "E-mail de acesso alterado. Use o novo e-mail no próximo login." };
}

/** Passo 1 da ativação: gera o segredo e devolve o QR Code para escanear. */
export async function iniciarDoisFatores(): Promise<DadosQr> {
  const admin = await exigirAdmin();
  const user = await prisma.user.findUnique({ where: { id: admin.id }, select: { totpAtivo: true } });
  if (user?.totpAtivo) return { erro: "O autenticador já está ativo." };

  const segredo = gerarSegredoBase32();
  await prisma.user.update({
    where: { id: admin.id },
    data: { totpSecret: cifrar(segredo), totpAtivo: false, totpUltimoPasso: null, codigosRecuperacao: null },
  });

  const uri = uriOtpauth({ emissor: "Painel Imobiliária", conta: admin.email, segredo });
  const qr = qrcode(0, "M");
  qr.addData(uri);
  qr.make();
  return { qr: qr.createDataURL(6, 2), segredo };
}

/** Passo 2: confere o primeiro código e liga o autenticador; mostra os códigos de recuperação (uma única vez). */
export async function confirmarDoisFatores(_estado: EstadoAtivacao, formData: FormData): Promise<EstadoAtivacao> {
  const admin = await exigirAdmin();
  const ip = await obterIp();
  if (await limiteExcedido(admin.email, ip)) return { erro: BLOQUEIO };

  const user = await prisma.user.findUnique({ where: { id: admin.id } });
  if (!user?.totpSecret || user.totpAtivo) return { erro: "Comece de novo: clique em \"Ativar autenticador\"." };

  const passo = verificarTotp(decifrar(user.totpSecret), String(formData.get("codigo") ?? ""), null);
  if (passo === null) {
    await registrarAuditoria({ acao: "LOGIN_FALHA", userId: admin.id, email: admin.email, ip, detalhe: "ativar autenticador" });
    return { erro: "Código incorreto. Confira o aplicativo e tente de novo (o código muda a cada 30 segundos)." };
  }

  const codigos = gerarCodigos();
  await prisma.user.update({
    where: { id: admin.id },
    data: { totpAtivo: true, totpUltimoPasso: passo, codigosRecuperacao: hashesDosCodigos(codigos) },
  });
  await registrarAuditoria({ acao: "DOIS_FATORES_ATIVADO", userId: admin.id, email: admin.email });
  // Sem revalidatePath de propósito: atualizar a página agora trocaria "Ativar" por "Ativo" e a
  // tela perderia os códigos de recuperação, que só aparecem desta vez. O botão "Já guardei,
  // concluir" recarrega a página.
  return { codigos };
}

/** Exige senha atual + um código válido (aplicativo ou recuperação) antes de mexer no autenticador. */
async function conferirSenhaECodigo(adminId: string, email: string, formData: FormData) {
  const conferencia = await conferirSenhaAtual(adminId, email, String(formData.get("senhaAtual") ?? ""), "autenticador");
  if ("erro" in conferencia) return conferencia;

  const ip = await obterIp();
  if (!(await conferirSegundoFator(conferencia.user, String(formData.get("codigo") ?? ""), ip))) {
    await registrarAuditoria({ acao: "LOGIN_FALHA", userId: adminId, email, ip, detalhe: "autenticador" });
    return { erro: "Código inválido ou já usado." } as const;
  }
  return conferencia;
}

export async function desativarDoisFatores(_estado: EstadoSimples, formData: FormData): Promise<EstadoSimples> {
  const admin = await exigirAdmin();
  const conferencia = await conferirSenhaECodigo(admin.id, admin.email, formData);
  if ("erro" in conferencia) return { erro: conferencia.erro };

  await prisma.user.update({
    where: { id: admin.id },
    data: { totpAtivo: false, totpSecret: null, totpUltimoPasso: null, codigosRecuperacao: null },
  });
  await registrarAuditoria({ acao: "DOIS_FATORES_DESATIVADO", userId: admin.id, email: admin.email });
  revalidatePath("/admin/seguranca");
  return { ok: true, mensagem: "Autenticador desativado." };
}

export async function gerarNovosCodigos(_estado: EstadoAtivacao, formData: FormData): Promise<EstadoAtivacao> {
  const admin = await exigirAdmin();
  const conferencia = await conferirSenhaECodigo(admin.id, admin.email, formData);
  if ("erro" in conferencia) return { erro: conferencia.erro };

  const codigos = gerarCodigos();
  await prisma.user.update({ where: { id: admin.id }, data: { codigosRecuperacao: hashesDosCodigos(codigos) } });
  await registrarAuditoria({ acao: "CODIGOS_RECUPERACAO_GERADOS", userId: admin.id, email: admin.email });
  revalidatePath("/admin/seguranca");
  return { codigos };
}
