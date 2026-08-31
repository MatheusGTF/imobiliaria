import { mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_WIDTH = 1920;

export async function saveUploadedPhoto(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.webp`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await sharp(bytes)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(filePath);

  return `/uploads/${filename}`;
}

export async function deletePhotoFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", url);
  try {
    await unlink(filePath);
  } catch {
    // arquivo já pode ter sido removido — ignora
  }
}
