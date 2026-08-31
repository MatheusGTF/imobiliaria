import { InquilinoForm } from "../InquilinoForm";
import { createInquilino } from "../actions";

export default function NovoInquilinoPage() {
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Novo inquilino</h1>
      <InquilinoForm action={createInquilino} />
    </div>
  );
}
