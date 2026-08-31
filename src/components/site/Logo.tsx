import Image from "next/image";

/**
 * Marca da imobiliária no cabeçalho/rodapé do portal.
 *
 * Se houver uma logo enviada em Configurações (empresa.logoUrl), ela é usada.
 * Caso contrário, desenhamos o símbolo dos dois telhados nas cores da marca.
 * O nome sempre aparece escrito ao lado.
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
        <TelhadosMark size={size} />
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

function TelhadosMark({ size }: { size: number }) {
  return (
    <svg
      width={(size * 74) / 44}
      height={size}
      viewBox="0 0 74 44"
      fill="none"
      aria-hidden="true"
    >
      {/* telhado esquerdo (cinza) */}
      <path
        d="M4 38 L25 9 L46 38"
        stroke="var(--color-ink-400)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* chaminé */}
      <path
        d="M33 21 L33 11"
        stroke="var(--color-ink-400)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* telhado direito (rosa) */}
      <path
        d="M28 38 L49 9 L70 38"
        stroke="var(--color-brand-300)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* três marcas */}
      <g fill="var(--color-ink-400)">
        <rect x="30" y="27" width="3.5" height="3.5" rx="0.6" />
        <rect x="36" y="27" width="3.5" height="3.5" rx="0.6" />
        <rect x="42" y="27" width="3.5" height="3.5" rx="0.6" />
      </g>
    </svg>
  );
}
