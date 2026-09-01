import { get } from "@vercel/blob";

/**
 * Serve as imagens guardadas no Vercel Blob (store privado). O navegador
 * acessa /f/uploads/xxx.webp; aqui a gente busca o blob com o token do
 * servidor (OIDC) e devolve o conteúdo com cache longo.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  const pathname = path.map(decodeURIComponent).join("/");

  let res;
  try {
    res = await get(pathname, { access: "private" });
  } catch {
    return new Response("Erro ao carregar a imagem", { status: 502 });
  }

  if (!res || res.statusCode !== 200 || !res.stream) {
    return new Response("Imagem não encontrada", { status: 404 });
  }

  return new Response(res.stream, {
    headers: {
      "Content-Type": res.blob.contentType || "application/octet-stream",
      "Content-Length": String(res.blob.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
