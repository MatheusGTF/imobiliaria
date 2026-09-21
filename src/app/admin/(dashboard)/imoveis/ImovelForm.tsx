import { Input, Select, Textarea } from "@/components/ui/Field";
import { MoneyField } from "@/components/ui/MoneyInput";
import { Button } from "@/components/ui/Button";
import { TIPOS_IMOVEL, STATUS_IMOVEL } from "@/lib/constants";
import { FinalidadeFields } from "./FinalidadeFields";
import type { Imovel, Proprietario } from "@prisma/client";

export function ImovelForm({
  imovel,
  proprietarios,
  action,
}: {
  imovel?: Imovel | null;
  proprietarios: Proprietario[];
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

        <Select label="Tipo" name="tipo" defaultValue={imovel?.tipo ?? "APARTAMENTO"} required>
          {TIPOS_IMOVEL.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>

        <Select label="Status" name="status" defaultValue={imovel?.status ?? "DISPONIVEL"} required>
          {STATUS_IMOVEL.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>

        <Select label="Proprietário" name="proprietarioId" defaultValue={imovel?.proprietarioId ?? ""}>
          <option value="">Não informado</option>
          {proprietarios.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>

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
          <MoneyField label="Condomínio" name="valorCondominio" defaultValue={imovel?.valorCondominio} />
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

      <div className="flex justify-end gap-3">
        <Button type="submit">{imovel ? "Salvar alterações" : "Cadastrar imóvel"}</Button>
      </div>
    </form>
  );
}
