/**
 * Retorno padrão de uma action que pode falhar por regra de negócio.
 * `podeForcar`: a recusa é uma proteção que o usuário pode conscientemente
 * dispensar (a UI mostra "Excluir mesmo assim").
 */
export type ResultadoAcao = { ok: true } | { error: string; podeForcar?: boolean };
