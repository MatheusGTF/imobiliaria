"use client";

import { useState } from "react";
import { Select, Textarea } from "@/components/ui/Field";
import { MoneyField } from "@/components/ui/MoneyInput";

const simNao = (v: boolean) => (v ? "SIM" : "NAO");

/**
 * Água e energia inclusas no aluguel + condomínio (com valor e uma
 * descrição de como funciona, útil p/ várias kitnets no mesmo terreno).
 */
export function DespesasFields({
  aguaInclusa,
  energiaInclusa,
  temCondominio,
  valorCondominio,
  condominioDescricao,
  iptuResponsavel,
}: {
  aguaInclusa: boolean;
  energiaInclusa: boolean;
  temCondominio: boolean;
  valorCondominio: number | null;
  condominioDescricao: string | null;
  iptuResponsavel: string;
}) {
  const [condominio, setCondominio] = useState(simNao(temCondominio));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Select label="Água inclusa no aluguel?" name="aguaInclusa" defaultValue={simNao(aguaInclusa)}>
        <option value="NAO">Não</option>
        <option value="SIM">Sim</option>
      </Select>

      <Select
        label="Energia elétrica inclusa no aluguel?"
        name="energiaInclusa"
        defaultValue={simNao(energiaInclusa)}
      >
        <option value="NAO">Não</option>
        <option value="SIM">Sim</option>
      </Select>

      <Select
        label="IPTU pago por"
        name="iptuResponsavel"
        defaultValue={iptuResponsavel === "LOCATARIO" ? "LOCATARIO" : "PROPRIETARIO"}
      >
        <option value="PROPRIETARIO">Proprietário</option>
        <option value="LOCATARIO">Inquilino</option>
      </Select>

      <Select
        label="Condomínio?"
        name="temCondominio"
        value={condominio}
        onChange={(e) => setCondominio(e.target.value)}
      >
        <option value="NAO">Não</option>
        <option value="SIM">Sim</option>
      </Select>

      {condominio === "SIM" && (
        <>
          <MoneyField label="Valor do condomínio" name="valorCondominio" defaultValue={valorCondominio} />
          <div className="md:col-span-2">
            <Textarea
              label="Como funciona o condomínio"
              name="condominioDescricao"
              defaultValue={condominioDescricao ?? ""}
              rows={3}
              placeholder="Ex.: 6 kitnets no mesmo terreno. O valor é rateado entre os moradores e cobre água do pátio, limpeza e portão."
            />
          </div>
        </>
      )}
    </div>
  );
}
