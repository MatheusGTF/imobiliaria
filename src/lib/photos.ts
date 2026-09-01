import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Na Vercel o sistema de arquivos é somente-leitura → grava no Vercel Blob
// (autenticação automática por OIDC, com BLOB_STORE_ID). Em dev local, grava
// em public/uploads. As imagens já chegam aqui pequenas: são redimensionadas
// e convertidas para .webp no navegador (src/lib/imageResize.ts).
const usarBlob =
  !!process.env.VERCEL ||
  !!process.env.BLOB_READ_WRITE_TOKEN ||
  !!process.env.BLOB_STORE_ID;

export async function saveUploadedPhoto(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/webp" ? "webp" : file.name.split(".").pop() || "jpg";
  const filename = `${randomUUID()}.${ext}`;

  if (usarBlob) {
    const { put } = await import("@vercel/blob");
    const { url } = await put(`uploads/${filename}`, bytes, {
      access: "public",
      contentType: file.type || "image/webp",
      addRandomSuffix: false,
    });
    return url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `/uploads/${filename}`;
}

/**
 * Apaga uma foto do storage. URLs `https://...` são do Vercel Blob;
 * `/uploads/...` são arquivos locais legados.
 */
export async function deletePhotoFile(url: string): Promise<void> {
  if (/^https?:\/\//.test(url)) {
    try {
      const { del } = await import("@vercel/blob");
      await del(url);
    } catch {
      // já pode ter sido removida — ignora
    }
    return;
  }

  if (!url.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", url));
  } catch {
    // arquivo já pode ter sido removido — ignora
  }
}
