import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Proprietario } from "@prisma/client";

export function ProprietarioForm({
  proprietario,
  action,
}: {
  proprietario?: Proprietario | null;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <Input label="Nome" name="nome" defaultValue={proprietario?.nome} required />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="CPF/CNPJ" name="cpfCnpj" defaultValue={proprietario?.cpfCnpj ?? ""} />
        <Input label="RG" name="rg" defaultValue={proprietario?.rg ?? ""} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Nacionalidade"
          name="nacionalidade"
          defaultValue={proprietario?.nacionalidade ?? "brasileiro(a)"}
        />
        <Input label="Estado civil" name="estadoCivil" defaultValue={proprietario?.estadoCivil ?? ""} />
        <Input label="Profissão" name="profissao" defaultValue={proprietario?.profissao ?? ""} />
      </div>
      <Input label="Endereço completo" name="endereco" defaultValue={proprietario?.endereco ?? ""} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Telefone" name="telefone" defaultValue={proprietario?.telefone ?? ""} />
        <Input label="Email" name="email" type="email" defaultValue={proprietario?.email ?? ""} />
      </div>
      <Textarea label="Observações" name="observacoes" defaultValue={proprietario?.observacoes ?? ""} />
      <p className="text-xs text-slate-500">
        Nome, CPF/RG, nacionalidade, estado civil, profissão e endereço são usados
        para qualificar o proprietário como LOCADOR no contrato de locação gerado.
      </p>
      <div className="flex justify-end">
        <Button type="submit">{proprietario ? "Salvar alterações" : "Cadastrar proprietário"}</Button>
      </div>
    </form>
  );
}
