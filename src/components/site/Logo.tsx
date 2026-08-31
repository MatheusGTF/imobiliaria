import Image from "next/image";

/**
 * Marca da imobiliária no cabeçalho/rodapé do portal.
 *
 * Se houver uma logo enviada em Configurações (empresa.logoUrl), ela é usada.
 * Caso contrário, mostramos um ícone de casa nas cores da marca — assim o
 * cabeçalho nunca fica quebrado. O nome sempre aparece escrito ao lado.
 */
export function Logo({
  nome,
  logoUrl,
  variant = "header",
}: {
  nome: string;
  logoUrl: string | null;
  variant?: "header" | "footer";
}) {
  const [primeira, ...resto] = nome.split(" ");
  const size = variant === "footer" ? 30 : 40;

  return (
    <span className="flex items-center gap-2">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={nome}
          width={size}
          height={size}
          className="object-contain"
          style={{ height: size, width: "auto" }}
        />
      ) : (
        <HouseMark size={size} />
      )}
      <span
        className={`whitespace-nowrap font-display font-extrabold uppercase leading-none tracking-tight ${
          variant === "footer" ? "text-xs" : "text-[0.7rem] sm:text-lg"
        }`}
      >
        <span className="text-brand-500">{primeira}</span>{" "}
        <span className={variant === "footer" ? "text-ink-400" : "text-ink-700"}>
          {resto.join(" ")}
        </span>
      </span>
    </span>
  );
}

function HouseMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 6 5 22h6v20h11V30h4v12h11V22h6L24 6Z" fill="var(--color-ink-400)" />
      <path d="M24 6 43 22h-6v20H26V30h-2v12" fill="var(--color-brand-300)" />
      <circle cx="20" cy="24" r="1.6" fill="var(--color-brand-500)" />
      <circle cx="24" cy="24" r="1.6" fill="var(--color-brand-500)" />
      <circle cx="28" cy="24" r="1.6" fill="var(--color-brand-500)" />
    </svg>
  );
}
