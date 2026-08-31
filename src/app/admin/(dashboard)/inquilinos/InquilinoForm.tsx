import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { TipoPessoaFields } from "./TipoPessoaFields";
import type { Inquilino } from "@prisma/client";

export function InquilinoForm({
  inquilino,
  action,
}: {
  inquilino?: Inquilino | null;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <TipoPessoaFields inquilino={inquilino} />
      <Input label="Endereço" name="endereco" defaultValue={inquilino?.endereco ?? ""} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Telefone" name="telefone" defaultValue={inquilino?.telefone ?? ""} />
        <Input label="Email" name="email" type="email" defaultValue={inquilino?.email ?? ""} />
      </div>
      <Textarea label="Observações" name="observacoes" defaultValue={inquilino?.observacoes ?? ""} />
      <p className="text-xs text-slate-500">
        Esses dados são usados para qualificar o inquilino como LOCATÁRIO no
        contrato de locação gerado.
      </p>
      <div className="flex justify-end">
        <Button type="submit">{inquilino ? "Salvar alterações" : "Cadastrar inquilino"}</Button>
      </div>
    </form>
  );
}
