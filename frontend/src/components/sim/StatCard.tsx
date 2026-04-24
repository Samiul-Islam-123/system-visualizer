interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "default" | "success" | "danger" | "warning";
}

const accentMap: Record<string, string> = {
  default: "text-foreground",
  success: "text-[oklch(var(--sim-success))]",
  danger: "text-[oklch(var(--sim-danger))]",
  warning: "text-[oklch(var(--sim-warning))]",
};

export function StatCard({ label, value, hint, accent = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 text-3xl font-semibold tabular-nums ${accentMap[accent]}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
