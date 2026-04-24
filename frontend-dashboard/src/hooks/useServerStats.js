import { useState, useEffect } from 'react';
import axios from 'axios';

const SERVER_MAPPING = {
  "Server 1": { id: "srv-1", name: "Server-01" },
  "Server 2": { id: "srv-2", name: "Server-02" },
  "Server 3": { id: "srv-3", name: "Server-03" }
};

export function useServerStats(intervalMs = 1000) {
  const [servers, setServers] = useState(() => {
    return Object.keys(SERVER_MAPPING).map(key => ({
      id: SERVER_MAPPING[key].id,
      name: SERVER_MAPPING[key].name,
      status: "running",
      cpu: 0,
      ram: 0,
      history: Array.from({ length: 20 }).map((_, j) => ({
        label: j.toString(),
        cpu: 0,
        ram: 0,
      })),
    }));
  });

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const resp = await axios.get('http://localhost:3000/usage');
        const data = resp.data;

        if (isMounted && data && data.servers) {
          setServers(currentServers => {
            return currentServers.map(server => {
              const originalKey = Object.keys(SERVER_MAPPING).find(
                key => SERVER_MAPPING[key].id === server.id
              );
              
              const serverData = data.servers[originalKey];
              if (!serverData) return server;

              const cpu = Math.round(serverData.cpuPercent);
              const ram = Math.round(serverData.memoryPercent);
              const status = serverData.status || "running";

              const newHistory = [...server.history.slice(1), {
                label: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                cpu,
                ram,
              }];

              return {
                ...server,
                status,
                cpu,
                ram,
                history: newHistory
              };
            });
          });
        }
      } catch (error) {
        // Suppress or log error
        console.error("Failed to fetch /usage:", error.message);
      }
    };

    fetchStats();
    const timer = setInterval(fetchStats, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [intervalMs]);

  return servers;
}
