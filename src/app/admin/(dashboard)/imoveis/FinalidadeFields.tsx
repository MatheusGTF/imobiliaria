"use client";

import { useState } from "react";
import { Select, Input } from "@/components/ui/Field";
import { FINALIDADE_IMOVEL, aceitaAluguel, aceitaVenda } from "@/lib/constants";

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
        <Input
          label="Valor do aluguel (R$)"
          name="valorAluguel"
          type="number"
          step="0.01"
          min={0}
          defaultValue={imovel?.valorAluguel ?? ""}
          required
        />
      )}

      {aceitaVenda(finalidade) && (
        <Input
          label="Valor de venda (R$)"
          name="valorVenda"
          type="number"
          step="0.01"
          min={0}
          defaultValue={imovel?.valorVenda ?? ""}
          required
        />
      )}
    </>
  );
}
