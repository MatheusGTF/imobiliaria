/**
 * Máscara de dinheiro no padrão brasileiro para campos de formulário.
 *
 * Regra: o PONTO é separador de milhar (é adicionado sozinho) e a VÍRGULA é
 * o separador decimal. Assim "5000", "5.000" e "5.000,00" resultam todos em
 * R$ 5.000,00 — antes, um <input type="number"> lia "5.000" como 5.
 */

export function formatarEntradaDinheiro(bruto: string): { display: string; valor: string } {
  const limpo = bruto.replace(/[^\d,]/g, "");
  const temVirgula = limpo.includes(",");
  const [inteiroBruto, ...resto] = limpo.split(",");
  const decimais = resto.join("").slice(0, 2);
  const inteiro = inteiroBruto.replace(/^0+(?=\d)/, "");

  if (inteiro === "" && !temVirgula) return { display: "", valor: "" };

  const inteiroFmt = (inteiro || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return {
    display: `${inteiroFmt}${temVirgula ? "," + decimais : ""}`,
    valor: `${inteiro || "0"}${decimais ? "." + decimais : ""}`,
  };
}

export function numeroParaDisplay(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "";
  return formatarEntradaDinheiro(String(n).replace(".", ",")).display;
}

export function valorParaNumero(valor: string): number | null {
  if (valor === "") return null;
  const n = Number(valor);
  return Number.isNaN(n) ? null : n;
}
