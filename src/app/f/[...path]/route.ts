import { get } from "@vercel/blob";

/**
 * Serve as imagens guardadas no Vercel Blob (store privado). O navegador
 * acessa /f/uploads/xxx.webp; aqui a gente busca o blob com o token do
 * servidor (OIDC) e devolve o conteúdo com cache longo.
 *
 * Só entrega arquivos de imagem dentro de `uploads/` — qualquer outro caminho
 * (ou tipo de arquivo) é recusado, para esta rota não virar uma porta de
 * leitura para o resto do storage.
 */
const CAMINHO_PERMITIDO = /^uploads\/[A-Za-z0-9._-]+\.(webp|jpe?g|png)$/i;
// O tipo da resposta vem da extensão validada acima — nunca do que está gravado no storage.
const TIPO_POR_EXTENSAO: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;

  let pathname: string;
  try {
    pathname = path.map(decodeURIComponent).join("/");
  } catch {
    return new Response("Imagem não encontrada", { status: 404 });
  }
  if (pathname.includes("..") || !CAMINHO_PERMITIDO.test(pathname)) {
    return new Response("Imagem não encontrada", { status: 404 });
  }

  let res;
  try {
    res = await get(pathname, { access: "private" });
  } catch {
    return new Response("Erro ao carregar a imagem", { status: 502 });
  }

  if (!res || res.statusCode !== 200 || !res.stream) {
    return new Response("Imagem não encontrada", { status: 404 });
  }

  const tipo = TIPO_POR_EXTENSAO[pathname.split(".").pop()!.toLowerCase()];

  return new Response(res.stream, {
    headers: {
      "Content-Type": tipo,
      "Content-Length": String(res.blob.size),
      // s-maxage deixa a rede (CDN) da Vercel guardar a foto: menos leitura do
      // storage e menos carga no site se alguém abrir a mesma foto milhares de vezes.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
