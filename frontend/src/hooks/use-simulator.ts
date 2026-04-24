import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  emptyMetrics,
  pickEndpoint,
  type RequestType,
  type SimMetrics,
  type SimSettings,
  type TimelinePoint,
} from "@/lib/simulator-types";

const MAX_POINTS = 60;

export function useSimulator() {
  const [metrics, setMetrics] = useState<SimMetrics>(emptyMetrics());
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const metricsRef = useRef<SimMetrics>(emptyMetrics());
  const lastSnapshotRef = useRef<{ total: number; success: number; failed: number; totalTime: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (tickerRef.current) clearInterval(tickerRef.current);
    intervalRef.current = null;
    tickerRef.current = null;
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    metricsRef.current = emptyMetrics();
    lastSnapshotRef.current = null;
    setMetrics(emptyMetrics());
    setTimeline([]);
    setElapsed(0);
  }, [stop]);

  const start = useCallback(
    (settings: SimSettings) => {
      reset();
      setRunning(true);
      startRef.current = Date.now();

      const intervalMs = Math.max(5, 1000 / settings.rps);

      intervalRef.current = setInterval(() => {
        const { type, endpoint } = pickEndpoint(settings.variation);
        const url = `${settings.apiBase}${endpoint}`;

        metricsRef.current.total++;
        metricsRef.current.types[type].count++;

        const reqStart = Date.now();
        axios
          .get(url, { timeout: 5000 })
          .then(() => {
            const time = Date.now() - reqStart;
            metricsRef.current.success++;
            metricsRef.current.types[type].success++;
            metricsRef.current.types[type].totalTime += time;
          })
          .catch(() => {
            metricsRef.current.failed++;
            metricsRef.current.types[type].failed++;
          });

        if (Date.now() - startRef.current > settings.durationSec * 1000) {
          stop();
        }
      }, intervalMs);

      tickerRef.current = setInterval(() => {
        const m = metricsRef.current;
        const totalTimeSum =
          m.types.light.totalTime + m.types.moderate.totalTime + m.types.heavy.totalTime;

        const last = lastSnapshotRef.current;
        const dTotal = last ? m.total - last.total : m.total;
        const dSuccess = last ? m.success - last.success : m.success;
        const dFailed = last ? m.failed - last.failed : m.failed;
        const dTime = last ? totalTimeSum - last.totalTime : totalTimeSum;

        const completedDelta = dSuccess + dFailed;
        const avgResponse = dSuccess > 0 ? dTime / dSuccess : 0;
        const successRate = completedDelta > 0 ? (dSuccess / completedDelta) * 100 : 0;
        const errorRate = completedDelta > 0 ? (dFailed / completedDelta) * 100 : 0;

        const elapsedSec = Math.floor((Date.now() - startRef.current) / 1000);
        setElapsed(elapsedSec);

        const point: TimelinePoint = {
          t: Date.now(),
          label: `${elapsedSec}s`,
          rps: dTotal,
          avgResponse: Math.round(avgResponse),
          successRate: Math.round(successRate * 10) / 10,
          errorRate: Math.round(errorRate * 10) / 10,
        };

        setTimeline((prev) => {
          const next = [...prev, point];
          return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
        });
        setMetrics({
          total: m.total,
          success: m.success,
          failed: m.failed,
          types: {
            light: { ...m.types.light },
            moderate: { ...m.types.moderate },
            heavy: { ...m.types.heavy },
          },
        });

        lastSnapshotRef.current = {
          total: m.total,
          success: m.success,
          failed: m.failed,
          totalTime: totalTimeSum,
        };
      }, 1000);
    },
    [reset, stop]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  const avgResponseOverall = (() => {
    const successCount = metrics.success;
    const totalTime =
      metrics.types.light.totalTime + metrics.types.moderate.totalTime + metrics.types.heavy.totalTime;
    return successCount > 0 ? Math.round(totalTime / successCount) : 0;
  })();

  const successRate = metrics.total > 0 ? (metrics.success / metrics.total) * 100 : 0;

  return {
    metrics,
    timeline,
    running,
    elapsed,
    avgResponseOverall,
    successRate,
    start,
    stop,
    reset,
  };
}

// Per-request type stats helper
export function typeStats(t: { count: number; success: number; failed: number; totalTime: number }) {
  const avg = t.success > 0 ? Math.round(t.totalTime / t.success) : 0;
  const rate = t.success + t.failed > 0 ? (t.success / (t.success + t.failed)) * 100 : 0;
  return { avg, rate };
}

export type { RequestType };
