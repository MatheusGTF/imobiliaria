import { randomInt } from "crypto";
import { hashComPimenta } from "@/lib/seguranca/cripto";

// Códigos de uso único para entrar se o celular com o autenticador for perdido.
// O banco guarda só o HASH; o código em si aparece uma única vez, na criação.

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I, para não confundir
export const QUANTIDADE_CODIGOS = 10;

function normalizar(codigo: string): string {
  return codigo.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function gerarCodigos(qtd = QUANTIDADE_CODIGOS): string[] {
  return Array.from({ length: qtd }, () => {
    const letras = Array.from({ length: 10 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
    return `${letras.slice(0, 5)}-${letras.slice(5)}`;
  });
}

export function hashesDosCodigos(codigos: string[]): string {
  return JSON.stringify(codigos.map((c) => hashComPimenta(normalizar(c))));
}

export function lerHashes(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const lista = JSON.parse(json);
    return Array.isArray(lista) ? lista.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Se o código existe, devolve a lista (JSON) já SEM ele; senão, null. */
export function consumirCodigo(json: string | null | undefined, codigo: string): string | null {
  const limpo = normalizar(codigo);
  if (limpo.length !== 10) return null;
  const alvo = hashComPimenta(limpo);
  const hashes = lerHashes(json);
  const restantes = hashes.filter((h) => h !== alvo);
  return restantes.length === hashes.length ? null : JSON.stringify(restantes);
}
