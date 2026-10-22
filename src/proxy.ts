import { auth } from "@/lib/auth/auth";
import { NextResponse, type NextRequest } from "next/server";

// Roda antes de TODA página:
//  1. protege o /admin (quem não está logado vai para o login);
//  2. define a Política de Segurança de Conteúdo (CSP) com um "nonce" novo a
//     cada requisição — só scripts que carregam esse nonce executam, o que
//     bloqueia a injeção de código malicioso (XSS).
// O guia oficial do Next.js para isso: docs/01-app/02-guides/content-security-policy.md

function politicaDeConteudo(nonce: string): string {
  const dev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // 'unsafe-inline' só em estilos: o Next/React geram atributos style="..."
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

function comCabecalhos(res: NextResponse, csp: string): NextResponse {
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export default auth((req: NextRequest & { auth?: unknown }) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = politicaDeConteudo(nonce);
  const { pathname } = req.nextUrl;

  const entrando = pathname === "/admin/login";
  const areaAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const logado = !!req.auth;

  if (areaAdmin && !entrando && !logado) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    return comCabecalhos(NextResponse.redirect(url), csp);
  }

  if (entrando && logado) {
    return comCabecalhos(NextResponse.redirect(new URL("/admin", req.nextUrl.origin)), csp);
  }

  const cabecalhos = new Headers(req.headers);
  cabecalhos.set("x-nonce", nonce);
  cabecalhos.set("Content-Security-Policy", csp);
  return comCabecalhos(NextResponse.next({ request: { headers: cabecalhos } }), csp);
});

export const config = {
  // Tudo, menos arquivos estáticos do Next, a entrega de fotos e a rota do NextAuth.
  // (Não há exceção para "prefetch": a checagem de login vale para qualquer requisição.)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|f/|api/auth).*)"],
};
