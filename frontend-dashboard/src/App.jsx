import React from 'react';
import { useServerStats } from './hooks/useServerStats';
import { useSimulator } from './hooks/useSimulator';

import { ServerCard } from './components/ServerCard';
import { TrafficChart } from './components/TrafficChart';
import { ControlPanel } from './components/ControlPanel';
import { StatCard } from './components/StatCard';
import { DetailedResults } from './components/DetailedResults';
import { ConsoleLogs } from './components/ConsoleLogs';

function App() {
  const servers = useServerStats(1000); // 1 second interval
  const sim = useSimulator();

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Load Balancer Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              Monitor server health and simulate traffic in real-time
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span 
              className={`inline-block h-2 w-2 rounded-full ${sim.running ? "animate-pulse bg-[oklch(var(--success))]" : "bg-[oklch(var(--muted-foreground))]"}`} 
            />
            {sim.running ? "Simulation running" : "Simulation idle"}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {/* Servers Section */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Servers (Hardware Metrics)
            </h2>
            <span className="text-xs text-muted-foreground">refreshes every 1s</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servers.map((s) => (
              <ServerCard key={s.id} server={s} />
            ))}
          </div>
        </section>

        {/* Global Metrics Section */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Requests" value={sim.metrics.total} />
          <StatCard 
            label="Successful" 
            value={sim.metrics.success} 
            accent="success" 
            hint={`${sim.successRate.toFixed(1)}% success rate`}
          />
          <StatCard 
            label="Failed" 
            value={sim.metrics.failed} 
            accent="danger" 
          />
          <StatCard 
            label="Avg Response" 
            value={`${sim.avgResponseOverall} ms`} 
            accent="warning" 
            hint={sim.running ? "live" : "since last run"}
          />
        </section>

        {/* Traffic Chart and Control Panel */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TrafficChart data={sim.timeline} />
          </div>
          <ControlPanel 
            running={sim.running}
            elapsed={sim.elapsed}
            settings={sim.settings}
            setSettings={sim.setSettings}
            onStart={sim.start}
            onStop={sim.stop}
            onReset={sim.reset}
          />
        </section>
        
        {/* Detailed Results Table */}
        <section>
          <DetailedResults metrics={sim.metrics} />
        </section>

        {/* Console Logs */}
        <section>
          <ConsoleLogs logs={sim.logs} />
        </section>

      </main>
    </div>
  );
}

export default App;
