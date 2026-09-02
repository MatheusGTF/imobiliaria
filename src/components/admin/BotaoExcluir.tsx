"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ResultadoAcao } from "@/lib/acoes";

/**
 * Botão de exclusão que chama uma action e mostra o motivo se ela recusar
 * (ex.: "contrato tem pagamentos registrados"). Sem tela de erro / crash.
 */
export function BotaoExcluir({
  acao,
  redirecionarPara,
  confirmacao = "Tem certeza que deseja excluir? Essa ação não pode ser desfeita.",
  label = "Excluir",
}: {
  acao: () => Promise<ResultadoAcao>;
  redirecionarPara?: string;
  confirmacao?: string;
  label?: string;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function executar() {
    if (!window.confirm(confirmacao)) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await acao();
      if ("error" in res) {
        setErro(res.error);
        return;
      }
      window.location.href = redirecionarPara ?? window.location.pathname;
    } catch {
      setErro("Não foi possível concluir agora. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="danger" size="sm" onClick={executar} disabled={carregando}>
        {carregando ? "Excluindo..." : label}
      </Button>
      {erro && <p className="max-w-md text-sm text-red-600">{erro}</p>}
    </div>
  );
}
