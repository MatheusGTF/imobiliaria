import { Input, Select, Textarea } from "@/components/ui/Field";
import { MoneyField } from "@/components/ui/MoneyInput";
import { Button } from "@/components/ui/Button";
import { TIPOS_IMOVEL } from "@/lib/constants";
import { FinalidadeFields } from "./FinalidadeFields";
import { StatusEPessoasFields } from "./StatusEPessoasFields";
import { DespesasFields } from "./DespesasFields";
import type { Imovel, Inquilino, Proprietario } from "@prisma/client";

export function ImovelForm({
  imovel,
  proprietarios,
  inquilinos,
  action,
}: {
  imovel?: Imovel | null;
  proprietarios: Proprietario[];
  inquilinos: Inquilino[];
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input label="Título" name="titulo" defaultValue={imovel?.titulo} required />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Descrição" name="descricao" defaultValue={imovel?.descricao ?? ""} />
        </div>

        <Select label="Tipo" name="tipo" defaultValue={imovel?.tipo ?? "CASA"} required>
          {TIPOS_IMOVEL.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>

        <StatusEPessoasFields
          statusInicial={imovel?.status ?? "DISPONIVEL"}
          proprietarioIdInicial={imovel?.proprietarioId ?? ""}
          inquilinoIdInicial={imovel?.inquilinoId ?? ""}
          proprietarios={proprietarios.map((p) => ({ id: p.id, nome: p.nome }))}
          inquilinos={inquilinos.map((i) => ({ id: i.id, nome: i.nome }))}
        />

        <div className="flex items-end gap-6 pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="destaque" defaultChecked={imovel?.destaque} />
            Destaque no portal
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="mobiliado" defaultChecked={imovel?.mobiliado} />
            Mobiliado
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="aceitaPet" defaultChecked={imovel?.aceitaPet} />
            Aceita pet
          </label>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Endereço</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input label="CEP" name="cep" defaultValue={imovel?.cep ?? ""} />
          <div className="md:col-span-2">
            <Input label="Logradouro" name="logradouro" defaultValue={imovel?.logradouro ?? ""} />
          </div>
          <Input label="Número" name="numero" defaultValue={imovel?.numero ?? ""} />
          <Input label="Complemento" name="complemento" defaultValue={imovel?.complemento ?? ""} />
          <Input label="Bairro" name="bairro" defaultValue={imovel?.bairro ?? ""} />
          <Input label="Cidade" name="cidade" defaultValue={imovel?.cidade} required />
          <Input label="Estado (UF)" name="estado" maxLength={2} defaultValue={imovel?.estado} required />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Valores e características
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FinalidadeFields imovel={imovel} />
          <MoneyField label="IPTU" name="valorIptu" defaultValue={imovel?.valorIptu} />
          <Input
            label="Área (m²)"
            name="areaM2"
            type="number"
            step="0.01"
            min={0}
            defaultValue={imovel?.areaM2 ?? ""}
          />
          <Input label="Quartos" name="quartos" type="number" min={0} defaultValue={imovel?.quartos ?? ""} />
          <Input
            label="Banheiros"
            name="banheiros"
            type="number"
            min={0}
            defaultValue={imovel?.banheiros ?? ""}
          />
          <Input label="Vagas" name="vagas" type="number" min={0} defaultValue={imovel?.vagas ?? ""} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Água, energia, IPTU e condomínio
        </h3>
        <DespesasFields
          aguaInclusa={imovel?.aguaInclusa ?? false}
          energiaInclusa={imovel?.energiaInclusa ?? false}
          temCondominio={imovel?.temCondominio ?? false}
          valorCondominio={imovel?.valorCondominio ?? null}
          condominioDescricao={imovel?.condominioDescricao ?? null}
          iptuResponsavel={imovel?.iptuResponsavel ?? "PROPRIETARIO"}
        />
      </section>

      <div className="flex justify-end gap-3">
        <Button type="submit">{imovel ? "Salvar alterações" : "Cadastrar imóvel"}</Button>
      </div>
    </form>
  );
}
