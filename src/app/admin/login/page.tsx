"use client";

import { useActionState, useState } from "react";
import { loginAction } from "./actions";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [estado, formAction, pending] = useActionState(loginAction, undefined);
  // Campos controlados: o React limpa campos não controlados depois de cada envio,
  // e a senha precisa continuar preenchida quando o código do autenticador é pedido.
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const precisaCodigo = !!estado?.precisaCodigo;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Painel administrativo</h1>
        <p className="mb-6 text-sm text-slate-500">
          {precisaCodigo ? "Confirme a sua identidade" : "Entre com suas credenciais"}
        </p>
        <form action={formAction} className="space-y-4">
          <Input
            id="email"
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={precisaCodigo}
          />
          <Input
            id="password"
            label="Senha"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            readOnly={precisaCodigo}
          />
          {precisaCodigo && (
            <Input
              id="codigo"
              label="Código do autenticador"
              name="codigo"
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              autoFocus
              required
              maxLength={12}
              hint="Digite os 6 números do aplicativo autenticador (ou um código de recuperação)."
            />
          )}
          {estado?.erro && (
            <p role="alert" className="text-sm text-red-600">
              {estado.erro}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando..." : precisaCodigo ? "Confirmar" : "Entrar"}
          </Button>
          {precisaCodigo && (
            <a href="/admin/login" className="block text-center text-xs text-slate-500 hover:underline">
              Voltar
            </a>
          )}
        </form>
      </div>
    </div>
  );
}
