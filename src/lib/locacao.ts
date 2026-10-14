import { TIPOS_IMOVEL } from "@/lib/constants";

type Endereco = {
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
};

/** "Rua das Flores, nº 20" — só a rua e o número, para listas. */
export function ruaENumero(i: Endereco) {
  const partes = [i.logradouro, i.numero ? `nº ${i.numero}` : null, i.complemento].filter(Boolean);
  return partes.length ? partes.join(", ") : "-";
}

/** Texto sem acento e em minúsculas, para comparar buscas ("agua" acha "Água"). */
export function normalizarBusca(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Tipos de imóvel cujo nome casa com o termo digitado (ex.: "apart" → APARTAMENTO). */
export function tiposQueCasam(termo: string) {
  const t = normalizarBusca(termo);
  if (!t) return [];
  return TIPOS_IMOVEL.filter((tipo) => normalizarBusca(tipo.label).includes(t)).map((tipo) => tipo.value);
}
