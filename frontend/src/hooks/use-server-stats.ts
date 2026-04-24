import { useEffect, useRef, useState } from "react";

export interface ServerSample {
  t: number;
  label: string;
  cpu: number;
  ram: number;
}

export interface ServerState {
  id: string;
  name: string;
  cpu: number;
  ram: number;
  history: ServerSample[];
}

const SERVERS = [
  { id: "srv-1", name: "Server 01" },
  { id: "srv-2", name: "Server 02" },
  { id: "srv-3", name: "Server 03" },
];

const MAX = 20;

function rand(prev: number, min: number, max: number, jitter: number) {
  const next = prev + (Math.random() - 0.5) * jitter;
  return Math.max(min, Math.min(max, next));
}

// Dummy "API" — replace with real fetch when endpoint exists.
async function fetchServerMetrics(prev: ServerState[]): Promise<{ id: string; cpu: number; ram: number }[]> {
  return prev.map((s, i) => ({
    id: s.id,
    cpu: Math.round(rand(s.cpu || 30 + i * 10, 5, 95, 25)),
    ram: Math.round(rand(s.ram || 40 + i * 5, 15, 90, 18)),
  }));
}

export function useServerStats(intervalMs = 3000) {
  const [servers, setServers] = useState<ServerState[]>(() =>
    SERVERS.map((s, i) => ({
      ...s,
      cpu: 30 + i * 10,
      ram: 40 + i * 5,
      history: [],
    }))
  );
  const ref = useRef(servers);
  ref.current = servers;

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const data = await fetchServerMetrics(ref.current);
      if (!alive) return;
      const ts = Date.now();
      const label = new Date(ts).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" });
      setServers((prev) =>
        prev.map((s) => {
          const d = data.find((x) => x.id === s.id)!;
          const sample: ServerSample = { t: ts, label, cpu: d.cpu, ram: d.ram };
          const history = [...s.history, sample];
          return {
            ...s,
            cpu: d.cpu,
            ram: d.ram,
            history: history.length > MAX ? history.slice(history.length - MAX) : history,
          };
        })
      );
    };
    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return servers;
}
