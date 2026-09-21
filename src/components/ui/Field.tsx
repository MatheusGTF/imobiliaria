import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export const fieldClasses =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

export function Wrapper({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export function Input({
  label,
  error,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string }) {
  return (
    <Wrapper label={label} htmlFor={props.id} error={error} hint={hint}>
      <input className={clsx(fieldClasses, className)} {...props} />
    </Wrapper>
  );
}

export function Textarea({
  label,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <Wrapper label={label} htmlFor={props.id} error={error}>
      <textarea className={clsx(fieldClasses, className)} rows={4} {...props} />
    </Wrapper>
  );
}

export function Select({
  label,
  error,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  return (
    <Wrapper label={label} htmlFor={props.id} error={error}>
      <select className={clsx(fieldClasses, "bg-white", className)} {...props}>
        {children}
      </select>
    </Wrapper>
  );
}
