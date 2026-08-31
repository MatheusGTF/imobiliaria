import { aceitaAluguel, aceitaVenda } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

type ImovelPreco = {
  finalidade: string;
  valorAluguel: number | null;
  valorVenda: number | null;
};

export function PrecoImovel({ imovel, className }: { imovel: ImovelPreco; className?: string }) {
  const mostraAluguel = aceitaAluguel(imovel.finalidade) && imovel.valorAluguel != null;
  const mostraVenda = aceitaVenda(imovel.finalidade) && imovel.valorVenda != null;

  return (
    <p className={className ?? "font-semibold text-emerald-700"}>
      {mostraAluguel && (
        <>
          {formatCurrency(imovel.valorAluguel)}
          <span className="text-xs font-normal text-slate-400"> /mês</span>
        </>
      )}
      {mostraAluguel && mostraVenda && <span className="mx-1 text-slate-300">·</span>}
      {mostraVenda && (
        <>
          {formatCurrency(imovel.valorVenda)}
          <span className="text-xs font-normal text-slate-400"> à venda</span>
        </>
      )}
    </p>
  );
}
