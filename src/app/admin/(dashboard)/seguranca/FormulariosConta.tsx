"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { alterarEmail, alterarSenha } from "./actions";

function Mensagem({ estado }: { estado: { ok?: boolean; erro?: string; mensagem?: string } | undefined }) {
  if (estado?.erro) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {estado.erro}
      </p>
    );
  }
  if (estado?.ok) return <p className="text-sm text-emerald-700">{estado.mensagem}</p>;
  return null;
}

export function FormularioSenha() {
  const [estado, acao, pendente] = useActionState(alterarSenha, undefined);

  return (
    <form action={acao} className="max-w-md space-y-4">
      <Input id="senhaAtual" label="Senha atual" name="senhaAtual" type="password" required autoComplete="current-password" />
      <Input
        id="novaSenha"
        label="Nova senha"
        name="novaSenha"
        type="password"
        required
        minLength={12}
        autoComplete="new-password"
        hint="Pelo menos 12 caracteres, com letras e também números ou símbolos."
      />
      <Input id="confirmacao" label="Repita a nova senha" name="confirmacao" type="password" required autoComplete="new-password" />
      <Mensagem estado={estado} />
      <Button type="submit" disabled={pendente}>
        {pendente ? "Salvando..." : "Alterar senha"}
      </Button>
    </form>
  );
}

export function FormularioEmail({ emailAtual }: { emailAtual: string }) {
  const [estado, acao, pendente] = useActionState(alterarEmail, undefined);

  return (
    <form action={acao} className="max-w-md space-y-4">
      <p className="text-sm text-slate-600">
        E-mail de acesso atual: <strong>{emailAtual}</strong>
      </p>
      <Input id="novoEmail" label="Novo e-mail de acesso" name="novoEmail" type="email" required autoComplete="off" />
      <Input id="senhaAtualEmail" label="Senha atual (para confirmar)" name="senhaAtual" type="password" required autoComplete="current-password" />
      <Mensagem estado={estado} />
      <Button type="submit" disabled={pendente}>
        {pendente ? "Salvando..." : "Alterar e-mail"}
      </Button>
    </form>
  );
}
