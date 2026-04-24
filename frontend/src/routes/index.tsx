import { createFileRoute } from "@tanstack/react-router";
import { useSimulator } from "@/hooks/use-simulator";
import { useServerStats } from "@/hooks/use-server-stats";
import { ServerCard } from "@/components/sim/ServerCard";
import { TrafficChart } from "@/components/sim/TrafficChart";
import { ControlPanel } from "@/components/sim/ControlPanel";
import { StatCard } from "@/components/sim/StatCard";
import { TypeBreakdown } from "@/components/sim/TypeBreakdown";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Load Balancer Simulator — Dashboard" },
      {
        name: "description",
        content:
          "Minimalistic dashboard simulating load balancing and monitoring across three servers with live CPU, RAM, traffic, and response insights.",
      },
    ],
  }),
});

function Dashboard() {
  const sim = useSimulator();
  const servers = useServerStats(3000);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Load Balancer Simulator
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitor server health and synthetic traffic in real time
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                sim.running ? "animate-pulse bg-[oklch(var(--sim-success))]" : "bg-muted-foreground/40"
              }`}
            />
            {sim.running ? "Simulation running" : "Idle"}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {/* Servers */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Servers
            </h2>
            <span className="text-xs text-muted-foreground">refreshes every 3s</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servers.map((s) => (
              <ServerCard key={s.id} server={s} />
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Requests" value={sim.metrics.total} />
          <StatCard
            label="Successful"
            value={sim.metrics.success}
            accent="success"
            hint={`${sim.successRate.toFixed(1)}% success`}
          />
          <StatCard label="Failed" value={sim.metrics.failed} accent="danger" />
          <StatCard
            label="Avg Response"
            value={`${sim.avgResponseOverall} ms`}
            accent="warning"
            hint={sim.running ? "live" : "since last run"}
          />
        </section>

        {/* Traffic + control */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TrafficChart data={sim.timeline} />
          </div>
          <ControlPanel
            running={sim.running}
            elapsed={sim.elapsed}
            onStart={sim.start}
            onStop={sim.stop}
            onReset={sim.reset}
          />
        </section>

        {/* Breakdown */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              About this simulator
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              The traffic generator runs entirely in your browser, sending weighted requests
              (light, moderate, heavy) to the configured API base URL. Server CPU and RAM are
              currently driven by mock data updated every 3 seconds — wire up your real metrics
              endpoint inside <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">useServerStats</code>{" "}
              when ready. Use the control panel to tune RPS, the heavy-traffic bias, and duration.
            </p>
          </div>
          <TypeBreakdown metrics={sim.metrics} />
        </section>
      </main>
    </div>
  );
}
