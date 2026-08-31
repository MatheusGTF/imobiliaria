"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui/Field";

type ImovelOption = {
  id: string;
  titulo: string;
  cidade: string;
  estado: string;
  valorAluguel: number;
  valorCondominio: number | null;
  valorIptu: number | null;
};

export function ContratoImovelFields({ imoveis }: { imoveis: ImovelOption[] }) {
  const [selecionadoId, setSelecionadoId] = useState(imoveis[0]?.id ?? "");
  const [valores, setValores] = useState({
    valorAluguel: imoveis[0]?.valorAluguel ?? 0,
    valorCondominio: imoveis[0]?.valorCondominio ?? 0,
    valorIptu: imoveis[0]?.valorIptu ?? 0,
  });

  function onSelecionarImovel(id: string) {
    setSelecionadoId(id);
    const imovel = imoveis.find((i) => i.id === id);
    if (imovel) {
      setValores({
        valorAluguel: imovel.valorAluguel,
        valorCondominio: imovel.valorCondominio ?? 0,
        valorIptu: imovel.valorIptu ?? 0,
      });
    }
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
        <Input
          label="Valor do aluguel (R$)"
          name="valorAluguel"
          type="number"
          step="0.01"
          min={0}
          value={valores.valorAluguel}
          onChange={(e) => setValores((v) => ({ ...v, valorAluguel: Number(e.target.value) }))}
          required
        />
        <Input
          label="Condomínio (R$)"
          name="valorCondominio"
          type="number"
          step="0.01"
          min={0}
          value={valores.valorCondominio}
          onChange={(e) => setValores((v) => ({ ...v, valorCondominio: Number(e.target.value) }))}
        />
        <Input
          label="IPTU (R$)"
          name="valorIptu"
          type="number"
          step="0.01"
          min={0}
          value={valores.valorIptu}
          onChange={(e) => setValores((v) => ({ ...v, valorIptu: Number(e.target.value) }))}
        />
      </div>
    </>
  );
}
