import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Na Vercel o sistema de arquivos é somente-leitura → as fotos vão pro Vercel
// Blob (store privado; autenticação por OIDC via BLOB_STORE_ID). Como o store
// é privado, as imagens são servidas pela rota /f/[...path] (que usa o token
// do servidor). Em dev local, grava em public/uploads e serve estático.
// As imagens já chegam pequenas: são redimensionadas para .webp no navegador
// (src/lib/imageResize.ts).
const usarBlob =
  !!process.env.VERCEL ||
  !!process.env.BLOB_READ_WRITE_TOKEN ||
  !!process.env.BLOB_STORE_ID;

const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB (o navegador já envia bem menos)
const FORMATOS_ACEITOS = new Set(["jpeg", "png", "webp", "gif"]);

/**
 * Não confia no que o navegador informa (nome, tipo): abre o arquivo de verdade
 * com o sharp. Só passa imagem válida; o resultado é sempre um .webp novo, sem
 * metadados (EXIF, incluindo a localização GPS da foto) e no máximo 2000 px.
 */
async function prepararImagem(file: File): Promise<Buffer> {
  if (!file || file.size === 0) throw new Error("Arquivo vazio.");
  if (file.size > TAMANHO_MAXIMO) throw new Error("A imagem é grande demais (máximo 5 MB).");

  try {
    const imagem = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 });
    const { format } = await imagem.metadata();
    if (!format || !FORMATOS_ACEITOS.has(format)) throw new Error("formato não aceito");
    return await imagem
      .rotate() // aplica a orientação do EXIF antes de descartá-lo
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new Error("O arquivo enviado não é uma imagem válida (use JPG, PNG ou WebP).");
  }
}

export async function saveUploadedPhoto(file: File): Promise<string> {
  const bytes = await prepararImagem(file);
  const filename = `${randomUUID()}.webp`;

  if (usarBlob) {
    const { put } = await import("@vercel/blob");
    const { pathname } = await put(`uploads/${filename}`, bytes, {
      access: "private",
      contentType: "image/webp",
      addRandomSuffix: false,
    });
    return `/f/${pathname}`; // servido pela rota src/app/f/[...path]/route.ts
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `/uploads/${filename}`;
}

/**
 * Apaga uma foto do storage.
 *  - `/f/uploads/...`  → blob privado (por pathname)
 *  - `https://...`     → blob legado (por URL)
 *  - `/uploads/...`    → arquivo local legado
 */
export async function deletePhotoFile(url: string): Promise<void> {
  if (url.startsWith("/f/")) {
    try {
      const { del } = await import("@vercel/blob");
      await del(url.slice(3)); // "uploads/xyz.webp"
    } catch {
      // já pode ter sido removida — ignora
    }
    return;
  }

  if (/^https?:\/\//.test(url)) {
    try {
      const { del } = await import("@vercel/blob");
      await del(url);
    } catch {
      /* ignora */
    }
    return;
  }

  if (!url.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", url));
  } catch {
    /* ignora */
  }
}
