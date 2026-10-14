"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Field";
import { MoneyField } from "@/components/ui/MoneyInput";

type ImovelOption = {
  id: string;
  titulo: string;
  cidade: string;
  estado: string;
  valorAluguel: number;
  valorCondominio: number | null;
  valorIptu: number | null;
};

type Valores = {
  valorAluguel: number | null;
  valorCondominio: number | null;
  valorIptu: number | null;
};

function valoresDoImovel(imovel?: ImovelOption): Valores {
  return {
    valorAluguel: imovel?.valorAluguel || null,
    valorCondominio: imovel?.valorCondominio || null,
    valorIptu: imovel?.valorIptu || null,
  };
}

export function ContratoImovelFields({
  imoveis,
  imovelIdInicial,
}: {
  imoveis: ImovelOption[];
  imovelIdInicial?: string;
}) {
  // Vindo de "Novo contrato" na tela do imóvel, ele já chega selecionado.
  const inicial = imoveis.find((i) => i.id === imovelIdInicial) ?? imoveis[0];
  const [selecionadoId, setSelecionadoId] = useState(inicial?.id ?? "");
  const [valores, setValores] = useState<Valores>(valoresDoImovel(inicial));

  function onSelecionarImovel(id: string) {
    setSelecionadoId(id);
    setValores(valoresDoImovel(imoveis.find((i) => i.id === id)));
  }

  return (
    <>
      <Select
        label="Imóvel"
        name="imovelId"
        value={selecionadoId}
        onChange={(e) => onSelecionarImovel(e.target.value)}
        required
      >
        <option value="" disabled>
          Selecione um imóvel
        </option>
        {imoveis.map((i) => (
          <option key={i.id} value={i.id}>
            {i.titulo} — {i.cidade}/{i.estado}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MoneyField
          label="Valor do aluguel"
          name="valorAluguel"
          value={valores.valorAluguel}
          onValueChange={(v) => setValores((atual) => ({ ...atual, valorAluguel: v }))}
          required
        />
        <MoneyField
          label="Condomínio"
          name="valorCondominio"
          value={valores.valorCondominio}
          onValueChange={(v) => setValores((atual) => ({ ...atual, valorCondominio: v }))}
        />
        <MoneyField
          label="IPTU"
          name="valorIptu"
          value={valores.valorIptu}
          onValueChange={(v) => setValores((atual) => ({ ...atual, valorIptu: v }))}
        />
      </div>
    </>
  );
}
