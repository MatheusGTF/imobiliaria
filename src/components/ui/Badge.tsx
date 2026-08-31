import clsx from "clsx";

const colorClasses: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-800",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-slate-100 text-slate-700",
  red: "bg-red-100 text-red-800",
  yellow: "bg-amber-100 text-amber-800",
};

export function Badge({ color = "gray", children }: { color?: string; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses[color] ?? colorClasses.gray
      )}
    >
      {children}
    </span>
  );
}
