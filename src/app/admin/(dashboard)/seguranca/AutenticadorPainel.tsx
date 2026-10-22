"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  confirmarDoisFatores,
  desativarDoisFatores,
  gerarNovosCodigos,
  iniciarDoisFatores,
  type DadosQr,
} from "./actions";

function CodigosDeRecuperacao({ codigos }: { codigos: string[] }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigos.join("\n"));
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
      <div>
        <h3 className="font-semibold text-amber-900">Guarde estes códigos de recuperação</h3>
        <p className="mt-1 text-sm text-amber-900">
          Eles aparecem <strong>só agora</strong>. Se você perder o celular, cada código entra no painel uma única vez.
          Anote em papel ou guarde em um gerenciador de senhas — nunca em arquivo solto no computador.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-2 font-mono text-sm text-slate-900 sm:grid-cols-3">
        {codigos.map((c) => (
          <li key={c} className="rounded bg-white px-3 py-1.5 text-center shadow-sm">
            {c}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={copiar}>
          {copiado ? "Copiado!" : "Copiar códigos"}
        </Button>
        <Button type="button" onClick={() => window.location.reload()}>
          Já guardei, concluir
        </Button>
      </div>
    </div>
  );
}

function Ativar() {
  const [dados, setDados] = useState<DadosQr | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [estado, acao, pendente] = useActionState(confirmarDoisFatores, undefined);

  async function comecar() {
    setCarregando(true);
    setDados(await iniciarDoisFatores());
    setCarregando(false);
  }

  if (estado?.codigos) return <CodigosDeRecuperacao codigos={estado.codigos} />;

  if (!dados) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          O autenticador pede, além da senha, um código de 6 números que muda a cada 30 segundos e aparece no seu
          celular. Mesmo que alguém descubra a senha, não consegue entrar sem o celular.
        </p>
        <Button type="button" onClick={comecar} disabled={carregando}>
          {carregando ? "Preparando..." : "Ativar autenticador"}
        </Button>
      </div>
    );
  }

  if ("erro" in dados) return <p className="text-sm text-red-600">{dados.erro}</p>;

  return (
    <div className="space-y-4">
      <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
        <li>
          Instale no celular um aplicativo autenticador (Google Authenticator, Microsoft Authenticator, Authy…).
        </li>
        <li>No aplicativo, escolha &quot;adicionar conta&quot; e escaneie o QR Code abaixo.</li>
        <li>Digite aqui o código de 6 números que o aplicativo mostrar.</li>
      </ol>
      <div className="flex flex-wrap items-start gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dados.qr} alt="QR Code para o aplicativo autenticador" width={200} height={200} className="rounded border border-slate-200 bg-white p-1" />
        <div className="space-y-1 text-sm text-slate-600">
          <p>Não consegue escanear? Digite esta chave no aplicativo:</p>
          <p className="break-all rounded bg-slate-100 px-3 py-2 font-mono text-slate-900">{dados.segredo}</p>
        </div>
      </div>
      <form action={acao} className="max-w-xs space-y-3">
        <Input
          id="codigoAtivacao"
          label="Código de 6 números"
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          required
        />
        {estado?.erro && (
          <p role="alert" className="text-sm text-red-600">
            {estado.erro}
          </p>
        )}
        <Button type="submit" disabled={pendente}>
          {pendente ? "Conferindo..." : "Confirmar e ativar"}
        </Button>
      </form>
    </div>
  );
}

function Ativo({ codigosRestantes }: { codigosRestantes: number }) {
  const [novos, acaoNovos, pendenteNovos] = useActionState(gerarNovosCodigos, undefined);
  const [desativar, acaoDesativar, pendenteDesativar] = useActionState(desativarDoisFatores, undefined);

  if (novos?.codigos) return <CodigosDeRecuperacao codigos={novos.codigos} />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-emerald-700">
        ✓ Autenticador ativo. Códigos de recuperação restantes: <strong>{codigosRestantes}</strong>
        {codigosRestantes <= 2 && " — gere novos em breve."}
      </p>

      <details className="rounded-lg border border-slate-200 p-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-800">Gerar novos códigos de recuperação</summary>
        <form action={acaoNovos} className="mt-4 max-w-sm space-y-3">
          <p className="text-xs text-slate-500">Os códigos antigos deixam de valer.</p>
          <Input id="senhaNovos" label="Senha atual" name="senhaAtual" type="password" required autoComplete="current-password" />
          <Input id="codigoNovos" label="Código do aplicativo" name="codigo" inputMode="numeric" autoComplete="one-time-code" maxLength={12} required />
          {novos?.erro && <p role="alert" className="text-sm text-red-600">{novos.erro}</p>}
          <Button type="submit" variant="secondary" disabled={pendenteNovos}>
            {pendenteNovos ? "Gerando..." : "Gerar novos códigos"}
          </Button>
        </form>
      </details>

      <details className="rounded-lg border border-red-200 p-4">
        <summary className="cursor-pointer text-sm font-medium text-red-700">Desativar o autenticador</summary>
        <form action={acaoDesativar} className="mt-4 max-w-sm space-y-3">
          <p className="text-xs text-slate-500">Isso deixa o painel protegido só pela senha. Não recomendado.</p>
          <Input id="senhaDesativar" label="Senha atual" name="senhaAtual" type="password" required autoComplete="current-password" />
          <Input id="codigoDesativar" label="Código do aplicativo" name="codigo" inputMode="numeric" autoComplete="one-time-code" maxLength={12} required />
          {desativar?.erro && <p role="alert" className="text-sm text-red-600">{desativar.erro}</p>}
          {desativar?.ok && <p className="text-sm text-emerald-700">{desativar.mensagem}</p>}
          <Button type="submit" variant="danger" disabled={pendenteDesativar}>
            {pendenteDesativar ? "Desativando..." : "Desativar autenticador"}
          </Button>
        </form>
      </details>
    </div>
  );
}

export function AutenticadorPainel({ ativo, codigosRestantes }: { ativo: boolean; codigosRestantes: number }) {
  return ativo ? <Ativo codigosRestantes={codigosRestantes} /> : <Ativar />;
}
