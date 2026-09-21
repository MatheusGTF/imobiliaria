"use client";

import { useState } from "react";
import clsx from "clsx";
import { Wrapper, fieldClasses } from "./Field";
import { formatarEntradaDinheiro, numeroParaDisplay, valorParaNumero } from "@/lib/money";

type MoneyInputProps = {
  name: string;
  id?: string;
  /** valor inicial (campo não controlado) */
  defaultValue?: number | null;
  /** valor controlado — quando informado, o pai manda no campo */
  value?: number | null;
  onValueChange?: (valor: number | null) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  title?: string;
  /** classes do <input> visível (por padrão, o estilo do painel) */
  className?: string;
  /** mostra o "R$" dentro do campo */
  prefixo?: boolean;
  /** classes do contêiner (ex.: ocupar colunas de um grid) */
  wrapperClassName?: string;
};

/**
 * Campo de dinheiro em reais: o usuário digita 5000 ou 5.000,50 e o campo
 * formata sozinho. O valor enviado no formulário (input hidden `name`) é
 * sempre decimal com ponto ("5000.50"), que o servidor já sabe ler.
 */
export function MoneyInput({
  name,
  id,
  defaultValue,
  value,
  onValueChange,
  required,
  disabled,
  placeholder = "0,00",
  title,
  className,
  prefixo = true,
  wrapperClassName,
}: MoneyInputProps) {
  const controlado = value !== undefined;
  const [display, setDisplay] = useState(() => numeroParaDisplay(controlado ? value : defaultValue));

  // Sincroniza quando o pai muda o valor de fora (ex.: escolher outro imóvel).
  // Ajuste de estado durante a renderização (padrão recomendado pelo React).
  const [ultimoValor, setUltimoValor] = useState(value);
  if (controlado && value !== ultimoValor) {
    setUltimoValor(value);
    const atual = valorParaNumero(formatarEntradaDinheiro(display).valor);
    if (atual !== (value ?? null)) setDisplay(numeroParaDisplay(value));
  }

  const { valor } = formatarEntradaDinheiro(display);

  return (
    <div className={clsx("relative", wrapperClassName)}>
      {prefixo && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          R$
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={display}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        title={title}
        className={clsx(className ?? fieldClasses, prefixo && "pl-9")}
        onChange={(e) => {
          const novo = formatarEntradaDinheiro(e.target.value);
          setDisplay(novo.display);
          onValueChange?.(valorParaNumero(novo.valor));
        }}
      />
      <input type="hidden" name={name} value={valor} disabled={disabled} />
    </div>
  );
}

/** Versão com rótulo, no padrão dos demais campos do painel. */
export function MoneyField({
  label,
  hint,
  ...props
}: MoneyInputProps & { label: string; hint?: string }) {
  const id = props.id ?? `money-${props.name}`;
  return (
    <Wrapper label={label} htmlFor={id} hint={hint}>
      <MoneyInput {...props} id={id} />
    </Wrapper>
  );
}
