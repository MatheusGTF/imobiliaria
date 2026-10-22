import { exigirAdmin } from "@/lib/auth/acesso";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { lerHashes } from "@/lib/seguranca/codigosRecuperacao";
import { acaoSuspeita, rotuloAuditoria } from "@/lib/seguranca/rotulos";
import { AutenticadorPainel } from "./AutenticadorPainel";
import { FormularioEmail, FormularioSenha } from "./FormulariosConta";

export const metadata = { title: "Segurança" };

function dataHora(d: Date) {
  return d.toLocaleString("pt-BR", { timeZone: "America/Campo_Grande", dateStyle: "short", timeStyle: "short" });
}

export default async function SegurancaPage() {
  const admin = await exigirAdmin();

  const [user, atividades] = await Promise.all([
    prisma.user.findUnique({
      where: { id: admin.id },
      select: { email: true, totpAtivo: true, codigosRecuperacao: true },
    }),
    prisma.logAuditoria.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
  ]);

  const autenticadorAtivo = !!user?.totpAtivo;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Segurança</h1>
        <p className="text-sm text-slate-500">
          Proteja o acesso ao painel — ele guarda dados pessoais de proprietários, inquilinos e contratos.
        </p>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-medium text-slate-900">Autenticador em duas etapas</h2>
          {autenticadorAtivo ? <Badge color="green">Ativo</Badge> : <Badge color="red">Desativado</Badge>}
        </div>
        <AutenticadorPainel
          ativo={autenticadorAtivo}
          codigosRestantes={lerHashes(user?.codigosRecuperacao).length}
        />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-medium text-slate-900">Alterar senha</h2>
        <FormularioSenha />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-medium text-slate-900">E-mail de acesso</h2>
        <FormularioEmail emailAtual={user?.email ?? admin.email} />
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-medium text-slate-900">Atividade recente</h2>
        <p className="mb-4 text-sm text-slate-500">
          Acessos e operações sensíveis. Se aparecer algo que você não fez, troque a senha na hora. Os registros são
          apagados automaticamente após 180 dias.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Quando</th>
                <th className="py-2 pr-4">O que aconteceu</th>
                <th className="py-2 pr-4">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {atividades.map((a) => (
                <tr key={a.id}>
                  <td className="whitespace-nowrap py-2 pr-4 text-slate-600">{dataHora(a.createdAt)}</td>
                  <td className="py-2 pr-4">
                    <span className={acaoSuspeita(a.acao) ? "font-medium text-red-700" : "text-slate-800"}>
                      {rotuloAuditoria(a.acao)}
                    </span>
                    {a.email && acaoSuspeita(a.acao) && <span className="ml-2 text-xs text-slate-500">({a.email})</span>}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-4 font-mono text-xs text-slate-500">{a.ip ?? "—"}</td>
                </tr>
              ))}
              {atividades.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-slate-500">
                    Nenhuma atividade registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
