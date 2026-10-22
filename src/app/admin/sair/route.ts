import { signOut } from "@/lib/auth/auth";

// Encerra a sessão e volta para o login. É para onde `exigirAdmin` manda quem tem
// uma sessão que já não vale (por exemplo, o usuário foi removido do sistema):
// sem isto, o proxy (que só enxerga o cookie) e a página ficariam um empurrando
// o outro entre /admin e /admin/login.
export async function GET() {
  await signOut({ redirectTo: "/admin/login" });
}
