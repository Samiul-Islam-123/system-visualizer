import { typeStats } from "@/hooks/use-simulator";
import type { SimMetrics } from "@/lib/simulator-types";

interface Props {
  metrics: SimMetrics;
}

const ROWS: { key: "light" | "moderate" | "heavy"; label: string; color: string }[] = [
  { key: "light", label: "Light", color: "oklch(var(--sim-success))" },
  { key: "moderate", label: "Moderate", color: "oklch(var(--sim-warning))" },
  { key: "heavy", label: "Heavy", color: "oklch(var(--sim-danger))" },
];

export function TypeBreakdown({ metrics }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Request types
      </div>
      <div className="mt-1 text-base font-semibold text-foreground">Breakdown</div>

      <div className="mt-4 space-y-4">
        {ROWS.map(({ key, label, color }) => {
          const t = metrics.types[key];
          const { avg, rate } = typeStats(t);
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-foreground">{label}</span>
                </div>
                <span className="tabular-nums text-muted-foreground">{t.count} reqs</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full transition-all"
                  style={{ width: `${rate}%`, backgroundColor: color }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>
                  {t.success} ok · {t.failed} fail
                </span>
                <span>avg {avg} ms</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
