import Link from "next/link";

type LogoProps = {
  compact?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="ClassIntel home">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30">
        CI
      </span>
      <span className="leading-tight">
        <span className="block text-base font-semibold text-white">ClassIntel</span>
        {!compact ? (
          <span className="block text-xs uppercase tracking-[0.22em] text-cyan-200/80">
            Professor-Aware Study AI
          </span>
        ) : null}
      </span>
    </Link>
  );
}
