import type { MetadataRoute } from "next";

// Os buscadores (Google etc.) não devem indexar o painel nem as rotas internas.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
  };
}
