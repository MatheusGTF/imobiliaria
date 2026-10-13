"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ResultadoAcao } from "@/lib/acoes";

/**
 * Botão de exclusão que chama uma action e mostra o motivo se ela recusar
 * (ex.: "contrato tem pagamentos registrados"). Sem tela de erro / crash.
 * Quando a recusa é uma proteção que pode ser dispensada (`podeForcar`),
 * aparece "Excluir mesmo assim", com confirmação reforçada.
 */
export function BotaoExcluir({
  acao,
  redirecionarPara,
  confirmacao = "Tem certeza que deseja excluir? Essa ação não pode ser desfeita.",
  confirmacaoForcada = "Isso apaga o item e TODO o histórico ligado a ele (inclusive pagamentos já feitos). Não dá para desfazer. Continuar?",
  label = "Excluir",
}: {
  acao: (forcar?: boolean) => Promise<ResultadoAcao>;
  redirecionarPara?: string;
  confirmacao?: string;
  confirmacaoForcada?: string;
  label?: string;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [podeForcar, setPodeForcar] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function executar(forcar: boolean) {
    if (!window.confirm(forcar ? confirmacaoForcada : confirmacao)) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = forcar ? await acao(true) : await acao();
      if ("error" in res) {
        setErro(res.error);
        setPodeForcar(!!res.podeForcar);
        return;
      }
      window.location.href = redirecionarPara ?? window.location.pathname;
    } catch {
      setErro("Não foi possível concluir agora. Tente novamente.");
      setPodeForcar(false);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="danger" size="sm" onClick={() => executar(false)} disabled={carregando}>
          {carregando ? "Excluindo..." : label}
        </Button>
        {podeForcar && (
          <Button type="button" variant="secondary" size="sm" onClick={() => executar(true)} disabled={carregando}>
            Excluir mesmo assim
          </Button>
        )}
      </div>
      {erro && <p className="max-w-md text-sm text-red-600">{erro}</p>}
    </div>
  );
}
