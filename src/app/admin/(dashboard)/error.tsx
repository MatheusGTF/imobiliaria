"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ErroPainel({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <h2 className="text-lg font-semibold text-slate-900">Não foi possível concluir a ação</h2>
      <p className="text-sm text-slate-600">
        {error?.message && !error.message.startsWith("An error occurred")
          ? error.message
          : "Ocorreu um erro inesperado. Tente novamente."}
      </p>
      <div className="flex justify-center gap-3">
        <Button type="button" onClick={reset}>
          Tentar novamente
        </Button>
        <Link href="/admin">
          <Button type="button" variant="secondary">
            Voltar ao painel
          </Button>
        </Link>
      </div>
    </div>
  );
}
