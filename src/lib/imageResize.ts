/**
 * Redimensiona uma imagem no navegador antes do upload:
 * limita a largura e converte para .webp. Assim o arquivo que sai do
 * navegador já é pequeno (o upload vai direto pro Vercel Blob, sem passar
 * pelo servidor — que tem limite de tamanho).
 */
export async function resizeToWebp(file: File, maxWidth = 1920, quality = 0.82): Promise<File> {
  // Só processa imagens rasterizadas; SVG/gif passam direto.
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // navegador não conseguiu decodificar — envia original
  }

  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) return file;

  const nome = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], nome, { type: "image/webp" });
}
