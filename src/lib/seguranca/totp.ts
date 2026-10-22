import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// Autenticador em duas etapas (TOTP — RFC 6238), compatível com Google
// Authenticator, Microsoft Authenticator, Authy, 1Password etc.
// Código de 6 dígitos, troca a cada 30 segundos, HMAC-SHA1.

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export const PASSO_SEGUNDOS = 30;

export function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let valor = 0;
  let saida = "";
  for (const byte of bytes) {
    valor = (valor << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      saida += ALFABETO[(valor >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) saida += ALFABETO[(valor << (5 - bits)) & 31];
  return saida;
}

export function base32Decode(texto: string): Buffer {
  const limpo = texto.replace(/[\s=-]/g, "").toUpperCase();
  let bits = 0;
  let valor = 0;
  const bytes: number[] = [];
  for (const c of limpo) {
    const i = ALFABETO.indexOf(c);
    if (i < 0) throw new Error("Segredo base32 inválido.");
    valor = (valor << 5) | i;
    bits += 5;
    if (bits >= 8) {
      bytes.push((valor >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** Novo segredo aleatório de 160 bits, em base32 (o que o app autenticador guarda). */
export function gerarSegredoBase32(): string {
  return base32Encode(randomBytes(20));
}

export function passoAtual(agoraMs = Date.now()): number {
  return Math.floor(agoraMs / 1000 / PASSO_SEGUNDOS);
}

export function codigoTotp(segredoBase32: string, passo: number): string {
  const contador = Buffer.alloc(8);
  contador.writeBigUInt64BE(BigInt(passo));
  const hmac = createHmac("sha1", base32Decode(segredoBase32)).update(contador).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binario =
    ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(binario % 1_000_000).padStart(6, "0");
}

/**
 * Confere o código digitado. Aceita o intervalo atual e um para cada lado
 * (diferença de relógio do celular). Devolve o intervalo aceito, ou null.
 * `ultimoPasso` impede reutilizar um código já usado (ataque de repetição).
 */
export function verificarTotp(
  segredoBase32: string,
  codigo: string,
  ultimoPasso: number | null,
  agoraMs = Date.now(),
): number | null {
  const digitado = codigo.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(digitado)) return null;

  const atual = passoAtual(agoraMs);
  for (let delta = -1; delta <= 1; delta++) {
    const passo = atual + delta;
    if (ultimoPasso !== null && passo <= ultimoPasso) continue;
    const esperado = Buffer.from(codigoTotp(segredoBase32, passo));
    if (timingSafeEqual(esperado, Buffer.from(digitado))) return passo;
  }
  return null;
}

/** Endereço otpauth:// que o QR Code carrega e o app autenticador entende. */
export function uriOtpauth({ emissor, conta, segredo }: { emissor: string; conta: string; segredo: string }): string {
  const rotulo = `${encodeURIComponent(emissor)}:${encodeURIComponent(conta)}`;
  const params = new URLSearchParams({
    secret: segredo,
    issuer: emissor,
    algorithm: "SHA1",
    digits: "6",
    period: String(PASSO_SEGUNDOS),
  });
  return `otpauth://totp/${rotulo}?${params.toString()}`;
}
