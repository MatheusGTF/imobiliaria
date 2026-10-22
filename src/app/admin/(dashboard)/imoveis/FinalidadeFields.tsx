"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Field";
import { MoneyField } from "@/components/ui/MoneyInput";
import { FINALIDADE_IMOVEL, aceitaAluguel, aceitaVenda } from "@/lib/comum/constants";

export function FinalidadeFields({
  imovel,
}: {
  imovel?: { finalidade: string; valorAluguel: number | null; valorVenda: number | null } | null;
}) {
  const [finalidade, setFinalidade] = useState(imovel?.finalidade ?? "ALUGUEL");

  return (
    <>
      <Select
        label="Finalidade"
        name="finalidade"
        value={finalidade}
        onChange={(e) => setFinalidade(e.target.value)}
        required
      >
        {FINALIDADE_IMOVEL.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </Select>

      {aceitaAluguel(finalidade) && (
        <MoneyField
          label="Valor do aluguel"
          name="valorAluguel"
          defaultValue={imovel?.valorAluguel}
          required
        />
      )}

      {aceitaVenda(finalidade) && (
        <MoneyField
          label="Valor de venda"
          name="valorVenda"
          defaultValue={imovel?.valorVenda}
          required
        />
      )}
    </>
  );
}
