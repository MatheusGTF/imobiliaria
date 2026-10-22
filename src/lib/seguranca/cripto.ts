import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

// Criptografia (AES-256-GCM) dos segredos guardados no banco, como o segredo do
// autenticador. A chave é derivada do AUTH_SECRET — por isso o AUTH_SECRET não
// pode ser trocado depois sem reconfigurar o autenticador (veja docs/SEGURANCA.md).

function chave(): Buffer {
  const segredo = process.env.AUTH_SECRET;
  if (!segredo || segredo.length < 16) {
    throw new Error("AUTH_SECRET ausente ou curto demais.");
  }
  return createHash("sha256").update(`imobiliaria:segredos:v1:${segredo}`).digest();
}

export function cifrar(texto: string): string {
  const iv = randomBytes(12);
  const cifra = createCipheriv("aes-256-gcm", chave(), iv);
  const conteudo = Buffer.concat([cifra.update(texto, "utf8"), cifra.final()]);
  const tag = cifra.getAuthTag();
  return ["v1", iv.toString("base64"), tag.toString("base64"), conteudo.toString("base64")].join(":");
}

export function decifrar(valor: string): string {
  const [versao, iv, tag, conteudo] = valor.split(":");
  if (versao !== "v1" || !iv || !tag || !conteudo) throw new Error("Segredo em formato inválido.");
  const decifra = createDecipheriv("aes-256-gcm", chave(), Buffer.from(iv, "base64"));
  decifra.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decifra.update(Buffer.from(conteudo, "base64")), decifra.final()]).toString("utf8");
}

/** Hash com "pimenta" (derivada do AUTH_SECRET) para códigos de recuperação. */
export function hashComPimenta(valor: string): string {
  return createHash("sha256").update(`imobiliaria:hash:v1:${process.env.AUTH_SECRET ?? ""}:${valor}`).digest("hex");
}
