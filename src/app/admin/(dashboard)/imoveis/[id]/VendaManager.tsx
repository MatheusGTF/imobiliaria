import { Input } from "@/components/ui/Field";
import { MoneyField } from "@/components/ui/MoneyInput";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { formatCurrency, formatDate } from "@/lib/format";
import { marcarVendido, reabrirAnuncio } from "../actions";
import type { Imovel } from "@prisma/client";

export function VendaManager({ imovel }: { imovel: Imovel }) {
  if (imovel.status === "VENDIDO") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          Vendido em {formatDate(imovel.dataVenda)} por {formatCurrency(imovel.valorVendaFinal)}
          {imovel.compradorNome ? ` para ${imovel.compradorNome}` : ""}
          {imovel.compradorContato ? ` (${imovel.compradorContato})` : ""}.
        </p>
        <form action={reabrirAnuncio}>
          <input type="hidden" name="id" value={imovel.id} />
          <ConfirmButton confirmMessage="Reabrir este anúncio como disponível? Os dados da venda serão apagados.">
            Reabrir anúncio
          </ConfirmButton>
        </form>
      </div>
    );
  }

  const marcarVendidoWithId = marcarVendido.bind(null, imovel.id);

  return (
    <form action={marcarVendidoWithId} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MoneyField
          label="Valor da venda"
          name="valorVendaFinal"
          defaultValue={imovel.valorVenda}
          required
        />
        <Input label="Data da venda" name="dataVenda" type="date" required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nome do comprador" name="compradorNome" />
        <Input label="Contato do comprador" name="compradorContato" />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="secondary">
          Marcar como vendido
        </Button>
      </div>
    </form>
  );
}
