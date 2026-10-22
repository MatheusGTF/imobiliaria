import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { logoutAction } from "./logout-action";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserRound,
  FileText,
  Wallet,
  Settings,
  LogOut,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/imoveis", label: "Imóveis", icon: Building2 },
  { href: "/admin/proprietarios", label: "Proprietários", icon: UserRound },
  { href: "/admin/inquilinos", label: "Inquilinos", icon: Users },
  { href: "/admin/contratos", label: "Contratos", icon: FileText },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

// No celular o menu vira uma barra no topo (com rolagem lateral); a partir de
// `md` volta a ser a coluna fixa da esquerda.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <aside className="flex flex-col border-b border-slate-200 bg-white md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:block md:px-5 md:py-4">
          <div>
            <span className="text-lg font-semibold text-slate-900">Imobiliária</span>
            <p className="hidden text-xs text-slate-500 md:block">Painel administrativo</p>
          </div>
          <form action={logoutAction} className="md:hidden">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogOut size={16} />
              Sair
            </button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-2 md:flex-1 md:flex-col md:gap-0 md:space-y-1 md:overflow-visible md:p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:gap-3"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-slate-200 p-3 md:block">
          <p className="truncate px-3 text-xs text-slate-500">{session?.user?.email}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogOut size={18} />
              Sair
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
