"use server";

import { signIn } from "@/lib/auth/auth";
import { AuthError } from "next-auth";

export type EstadoLogin = { erro?: string; precisaCodigo?: boolean } | undefined;

export async function loginAction(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const codigo = String(formData.get("codigo") ?? "").trim();

  try {
    // A verificação completa (limite de tentativas, senha e autenticador) acontece
    // dentro do `authorize` — veja src/lib/auth/auth.ts e src/lib/seguranca/login.ts.
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      codigo,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const code = (error as { code?: string }).code;
      if (code === "codigo_necessario") return { precisaCodigo: true };
      if (code === "codigo_invalido") {
        return { precisaCodigo: true, erro: "Código inválido ou já usado. Confira o aplicativo e tente de novo." };
      }
      if (code === "bloqueado") {
        return { erro: "Muitas tentativas. Aguarde 15 minutos e tente novamente." };
      }
      return { erro: "E-mail ou senha inválidos." };
    }
    throw error; // inclui o redirecionamento de login bem-sucedido
  }
}
