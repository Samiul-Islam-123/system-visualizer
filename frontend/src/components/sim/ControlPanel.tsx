import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DEFAULT_SETTINGS, type SimSettings } from "@/lib/simulator-types";

interface Props {
  running: boolean;
  elapsed: number;
  onStart: (s: SimSettings) => void;
  onStop: () => void;
  onReset: () => void;
}

export function ControlPanel({ running, elapsed, onStart, onStop, onReset }: Props) {
  const [settings, setSettings] = useState<SimSettings>(DEFAULT_SETTINGS);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Control Panel
          </div>
          <div className="text-base font-semibold text-foreground">Simulation settings</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              running ? "animate-pulse bg-[oklch(var(--sim-success))]" : "bg-muted-foreground/40"
            }`}
            aria-hidden
          />
          <span className="text-xs text-muted-foreground">
            {running ? `running • ${elapsed}s` : "idle"}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Requests per second</Label>
            <span className="text-sm font-medium tabular-nums">{settings.rps}</span>
          </div>
          <Slider
            value={[settings.rps]}
            min={1}
            max={100}
            step={1}
            onValueChange={(v) => setSettings((s) => ({ ...s, rps: v[0] }))}
            disabled={running}
            className="mt-2"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Variation (heavy bias)</Label>
            <span className="text-sm font-medium tabular-nums">{settings.variation.toFixed(2)}</span>
          </div>
          <Slider
            value={[settings.variation]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={(v) => setSettings((s) => ({ ...s, variation: v[0] }))}
            disabled={running}
            className="mt-2"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Duration (seconds)</Label>
            <span className="text-sm font-medium tabular-nums">{settings.durationSec}s</span>
          </div>
          <Slider
            value={[settings.durationSec]}
            min={5}
            max={300}
            step={5}
            onValueChange={(v) => setSettings((s) => ({ ...s, durationSec: v[0] }))}
            disabled={running}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">API base URL</Label>
          <Input
            value={settings.apiBase}
            onChange={(e) => setSettings((s) => ({ ...s, apiBase: e.target.value }))}
            disabled={running}
            className="mt-2 font-mono text-xs"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {!running ? (
          <Button onClick={() => onStart(settings)} className="flex-1">
            Start simulation
          </Button>
        ) : (
          <Button onClick={onStop} variant="destructive" className="flex-1">
            Stop
          </Button>
        )}
        <Button onClick={onReset} variant="outline" disabled={running}>
          Reset
        </Button>
      </div>
    </div>
  );
}
