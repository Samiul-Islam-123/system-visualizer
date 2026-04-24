import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ServerState } from "@/hooks/use-server-stats";

interface Props {
  server: ServerState;
}

function statusColor(value: number) {
  if (value >= 80) return "oklch(var(--sim-danger))";
  if (value >= 60) return "oklch(var(--sim-warning))";
  return "oklch(var(--sim-success))";
}

export function ServerCard({ server }: Props) {
  const cpuColor = statusColor(server.cpu);
  const ramColor = statusColor(server.ram);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {server.id}
          </div>
          <div className="text-base font-semibold text-foreground">{server.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: cpuColor }}
            aria-hidden
          />
          <span className="text-xs text-muted-foreground">live</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CPU</div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: cpuColor }}>
            {server.cpu}%
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">RAM</div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: ramColor }}>
            {server.ram}%
          </div>
        </div>
      </div>

      <div className="mt-3 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={server.history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
            />
            <Line
              type="monotone"
              dataKey="cpu"
              name="CPU"
              stroke="oklch(var(--sim-cpu))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="ram"
              name="RAM"
              stroke="oklch(var(--sim-ram))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: "oklch(var(--sim-cpu))" }}
          />
          CPU
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: "oklch(var(--sim-ram))" }}
          />
          RAM
        </span>
      </div>
    </div>
  );
}
