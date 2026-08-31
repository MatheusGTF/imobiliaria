import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_WIDTH = 1920;

// Em produção (Vercel) o sistema de arquivos é efêmero: as fotos precisam ir
// para o Vercel Blob. Basta a env BLOB_READ_WRITE_TOKEN estar presente.
// Em desenvolvimento, sem o token, as fotos ficam em public/uploads como antes.
const usarBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

async function processarWebp(file: File): Promise<Buffer> {
  const bytes = Buffer.from(await file.arrayBuffer());
  return sharp(bytes)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

export async function saveUploadedPhoto(file: File): Promise<string> {
  const webp = await processarWebp(file);
  const filename = `${randomUUID()}.webp`;

  if (usarBlob) {
    const { put } = await import("@vercel/blob");
    const { url } = await put(`uploads/${filename}`, webp, {
      access: "public",
      contentType: "image/webp",
    });
    return url; // URL https completa, guardada no banco
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), webp);
  return `/uploads/${filename}`;
}

export async function deletePhotoFile(url: string): Promise<void> {
  if (/^https?:\/\//.test(url)) {
    try {
      const { del } = await import("@vercel/blob");
      await del(url);
    } catch {
      // já pode ter sido removido — ignora
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
