export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatMonth(value: Date | string | null | undefined) {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** "@aguaclara.imoveis_" ou "instagram.com/x" ou URL completa → { handle, url } */
export function parseInstagram(value: string | null | undefined) {
  if (!value) return null;
  const handle = value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
  if (!handle) return null;
  return { handle: `@${handle}`, url: `https://instagram.com/${handle}` };
}

/** Telefone brasileiro em texto livre → link wa.me (assume DDI 55 se faltar). */
export function whatsappLink(telefone: string | null | undefined, texto?: string) {
  if (!telefone) return null;
  let digitos = telefone.replace(/\D/g, "");
  if (!digitos) return null;
  if (digitos.length <= 11) digitos = `55${digitos}`;
  const query = texto ? `?text=${encodeURIComponent(texto)}` : "";
  return `https://wa.me/${digitos}${query}`;
}
