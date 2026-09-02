/** Retorno padrão de uma action que pode falhar por regra de negócio. */
export type ResultadoAcao = { ok: true } | { error: string };
