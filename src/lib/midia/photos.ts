import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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

export async function saveUploadedPhoto(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/webp" ? "webp" : file.name.split(".").pop() || "jpg";
  const filename = `${randomUUID()}.${ext}`;

  if (usarBlob) {
    const { put } = await import("@vercel/blob");
    const { pathname } = await put(`uploads/${filename}`, bytes, {
      access: "private",
      contentType: file.type || "image/webp",
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
