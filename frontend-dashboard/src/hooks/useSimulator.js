import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useSimulator() {
  const [running, setRunning] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    success: 0,
    failed: 0,
    endpoints: {} // Dynamically track stats per endpoint
  });
  const [timeline, setTimeline] = useState([]);
  const [logs, setLogs] = useState([]);

  // Settings
  const [settings, setSettings] = useState({
    rps: 10,
    durationSec: 10,
    useVariation: false,
    baseUrl: 'http://localhost:3000/optimized',
    targetUrl: '0/analytics/heavy/deep-insights',
    urlList: '0/analytics/heavy/deep-insights\n0/analytics/moderate/revenue-by-state\n0/analytics/light/overview'
  });
  const [elapsed, setElapsed] = useState(0);

  // References to keep track of mutable state for the interval without re-rendering
  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Mutable stats for timeline charting
  const currentIntervalStats = useRef({ success: 0, failed: 0, total: 0 });

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setMetrics({
      total: 0,
      success: 0,
      failed: 0,
      endpoints: {}
    });
    setTimeline([]);
    setLogs([]);
    setElapsed(0);
  }, [stop]);

  const makeRequest = useCallback(async (url) => {
    const start = Date.now();
    currentIntervalStats.current.total++;

    // Ensure the endpoint is initialized in the metrics state
    setMetrics(prev => {
      if (!prev.endpoints[url]) {
        return {
          ...prev,
          endpoints: {
            ...prev.endpoints,
            [url]: { count: 0, success: 0, failed: 0, totalTime: 0 }
          }
        };
      }
      return prev;
    });

    try {
      const resp = await axios.get(url, { 
        timeout: 20000,
        validateStatus: () => true // Don't throw on non-2xx status codes
      });
      
      const time = Date.now() - start;
      const timeStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      console.log(`Response from ${url}: [Status ${resp.status}]`, resp.data);

      setLogs(prev => {
        const statusText = resp.status >= 200 && resp.status < 400 ? 'SUCCESS' : 'FAILED';
        const newLog = { id: Math.random().toString(36).substr(2, 9), text: `[${timeStr}] GET ${url} - ${resp.status} ${statusText} (${time}ms)`, status: resp.status };
        return [newLog, ...prev].slice(0, 100);
      });

      if (resp.status >= 200 && resp.status < 400) {
        currentIntervalStats.current.success++;

        setMetrics(prev => ({
          ...prev,
          total: prev.total + 1,
          success: prev.success + 1,
          endpoints: {
            ...prev.endpoints,
            [url]: {
              ...prev.endpoints[url],
              count: prev.endpoints[url].count + 1,
              success: prev.endpoints[url].success + 1,
              totalTime: prev.endpoints[url].totalTime + time
            }
          }
        }));
      } else {
        currentIntervalStats.current.failed++;

        setMetrics(prev => ({
          ...prev,
          total: prev.total + 1,
          failed: prev.failed + 1,
          endpoints: {
            ...prev.endpoints,
            [url]: {
              ...prev.endpoints[url],
              count: prev.endpoints[url].count + 1,
              failed: prev.endpoints[url].failed + 1
            }
          }
        }));
      }
    } catch (err) {
      const timeStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      console.log(`Network/Timeout Error from ${url}:`, err.message);
      
      setLogs(prev => {
        const newLog = { id: Math.random().toString(36).substr(2, 9), text: `[${timeStr}] GET ${url} - ERROR (${err.message})`, status: 0 };
        return [newLog, ...prev].slice(0, 100);
      });

      currentIntervalStats.current.failed++;

      setMetrics(prev => ({
        ...prev,
        total: prev.total + 1,
        failed: prev.failed + 1,
        endpoints: {
          ...prev.endpoints,
          [url]: {
            ...prev.endpoints[url],
            count: prev.endpoints[url].count + 1,
            failed: prev.endpoints[url].failed + 1
          }
        }
      }));
    }
  }, []);

  const start = useCallback(() => {
    if (running) return;

    reset();
    setRunning(true);
    startTimeRef.current = Date.now();

    // Traffic generator
    const urls = settings.urlList.split('\n').map(u => u.trim()).filter(Boolean);
    const intervalMs = 1000 / settings.rps;

    intervalRef.current = setInterval(() => {
      let urlToHit = settings.targetUrl;

      if (settings.useVariation && urls.length > 0) {
        urlToHit = urls[Math.floor(Math.random() * urls.length)];
      }

      // Basic check to prepend baseUrl if it's a relative path
      if (!urlToHit.startsWith('http')) {
        const base = settings.baseUrl.replace(/\/$/, '');
        const path = urlToHit.startsWith('/') ? urlToHit : `/${urlToHit}`;
        urlToHit = `${base}${path}`;
      }

      makeRequest(urlToHit);
    }, intervalMs);

  }, [running, settings, makeRequest, reset]);

  // Continuous timer for timeline charting and duration checking
  useEffect(() => {
    const timer = setInterval(() => {
      // Snapshot the stats outside the state updater to avoid Strict Mode double-invocation bugs
      const statsSnapshot = {
        success: currentIntervalStats.current.success,
        failed: currentIntervalStats.current.failed,
        total: currentIntervalStats.current.total
      };

      // Reset interval stats immediately
      currentIntervalStats.current = { success: 0, failed: 0, total: 0 };

      // Update timeline chart data continuously so late-arriving timeouts are plotted
      setTimeline(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          success: statsSnapshot.success,
          failed: statsSnapshot.failed,
          total: statsSnapshot.total
        }];

        // Keep last 30 data points
        if (newData.length > 30) return newData.slice(newData.length - 30);
        return newData;
      });

      if (running && startTimeRef.current) {
        const now = Date.now();
        const elapsedSec = Math.floor((now - startTimeRef.current) / 1000);
        setElapsed(elapsedSec);

        if (elapsedSec >= settings.durationSec) {
          stop();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [running, settings.durationSec, stop]);

  // Clean up on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  // Calculate overall average
  const endpointValues = Object.values(metrics.endpoints);
  const totalTimeAll = endpointValues.reduce((sum, ep) => sum + ep.totalTime, 0);
  const avgResponseOverall = metrics.success > 0 ? Math.round(totalTimeAll / metrics.success) : 0;

  return {
    running,
    metrics,
    timeline,
    logs,
    elapsed,
    settings,
    setSettings,
    start,
    stop,
    reset,
    successRate: metrics.total > 0 ? (metrics.success / metrics.total) * 100 : 0,
    avgResponseOverall
  };
}
