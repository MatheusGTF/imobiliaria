import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verificarLogin } from "@/lib/seguranca/login";
import { ipDosCabecalhos } from "@/lib/seguranca/auditoria";

// Erros com "code" próprio: a tela de login usa para saber o que pedir/mostrar
// sem revelar nada além do necessário.
class CodigoNecessario extends CredentialsSignin {
  code = "codigo_necessario";
}
class CodigoInvalido extends CredentialsSignin {
  code = "codigo_invalido";
}
class AcessoBloqueado extends CredentialsSignin {
  code = "bloqueado";
}

const OITO_HORAS = 8 * 60 * 60;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  // A sessão expira em 8 horas (era 30 dias): um computador esquecido logado
  // não fica aberto por semanas.
  session: { strategy: "jwt", maxAge: OITO_HORAS },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        codigo: { label: "Código do autenticador", type: "text" },
      },
      authorize: async (credentials, request) => {
        const resultado = await verificarLogin({
          email: String(credentials?.email ?? ""),
          senha: String(credentials?.password ?? ""),
          codigo: String(credentials?.codigo ?? ""),
          ip: ipDosCabecalhos(request.headers),
        });

        if (resultado.ok) return resultado.user;
        if (resultado.motivo === "codigo_necessario") throw new CodigoNecessario();
        if (resultado.motivo === "codigo_invalido") throw new CodigoInvalido();
        if (resultado.motivo === "bloqueado") throw new AcessoBloqueado();
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
});
