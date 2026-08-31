import { ProprietarioForm } from "../ProprietarioForm";
import { createProprietario } from "../actions";

export default function NovoProprietarioPage() {
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Novo proprietário</h1>
      <ProprietarioForm action={createProprietario} />
    </div>
  );
}
