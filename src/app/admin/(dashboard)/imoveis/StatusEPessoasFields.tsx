"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Field";
import { STATUS_IMOVEL } from "@/lib/constants";

type Pessoa = { id: string; nome: string };

/**
 * Status + proprietário + (quando o status é "Alugado") inquilino.
 * O campo do inquilino só aparece com o imóvel alugado, para ficar registrado
 * quem está morando/usando o imóvel.
 */
export function StatusEPessoasFields({
  statusInicial,
  proprietarioIdInicial,
  inquilinoIdInicial,
  proprietarios,
  inquilinos,
}: {
  statusInicial: string;
  proprietarioIdInicial: string;
  inquilinoIdInicial: string;
  proprietarios: Pessoa[];
  inquilinos: Pessoa[];
}) {
  const [status, setStatus] = useState(statusInicial);

  return (
    <>
      <Select
        label="Status"
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        required
      >
        {STATUS_IMOVEL.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>

      <Select label="Proprietário" name="proprietarioId" defaultValue={proprietarioIdInicial}>
        <option value="">Não informado</option>
        {proprietarios.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </Select>

      {status === "ALUGADO" && (
        <div className="md:col-span-2">
          <Select label="Inquilino" name="inquilinoId" defaultValue={inquilinoIdInicial}>
            <option value="">Não informado</option>
            {inquilinos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Select>
          {inquilinos.length === 0 && (
            <p className="mt-1 text-xs text-slate-500">
              Nenhum inquilino cadastrado ainda — cadastre em Inquilinos e volte aqui.
            </p>
          )}
        </div>
      )}
    </>
  );
}
