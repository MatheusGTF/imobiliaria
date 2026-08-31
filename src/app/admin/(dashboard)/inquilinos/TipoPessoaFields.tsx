"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui/Field";
import { TIPO_PESSOA } from "@/lib/constants";
import type { Inquilino } from "@prisma/client";

export function TipoPessoaFields({ inquilino }: { inquilino?: Inquilino | null }) {
  const [tipoPessoa, setTipoPessoa] = useState(inquilino?.tipoPessoa ?? "FISICA");
  const pj = tipoPessoa === "JURIDICA";

  return (
    <>
      <Select
        label="Tipo"
        name="tipoPessoa"
        value={tipoPessoa}
        onChange={(e) => setTipoPessoa(e.target.value)}
        required
      >
        {TIPO_PESSOA.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>

      <Input
        label={pj ? "Razão social" : "Nome completo"}
        name="nome"
        defaultValue={inquilino?.nome}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label={pj ? "CNPJ" : "CPF"} name="cpfCnpj" defaultValue={inquilino?.cpfCnpj ?? ""} />
        {pj ? (
          <Input
            label="Nome do responsável legal"
            name="representanteLegalNome"
            defaultValue={inquilino?.representanteLegalNome ?? ""}
          />
        ) : (
          <Input label="RG" name="rg" defaultValue={inquilino?.rg ?? ""} />
        )}
      </div>

      {!pj && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Nacionalidade"
            name="nacionalidade"
            defaultValue={inquilino?.nacionalidade ?? "brasileiro(a)"}
          />
          <Input label="Estado civil" name="estadoCivil" defaultValue={inquilino?.estadoCivil ?? ""} />
          <Input label="Profissão" name="profissao" defaultValue={inquilino?.profissao ?? ""} />
        </div>
      )}
    </>
  );
}
