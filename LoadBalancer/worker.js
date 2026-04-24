const { parentPort } = require('worker_threads');
const Docker = require('dockerode');

const docker = new Docker();

async function getAnalyticsContainers() {
  const containers = await docker.listContainers({ all: true }); // include stopped

  return containers
    .filter(c =>
      c.Names.some(name =>
        name.includes('data-analytics-server')
      )
    )
    .map((c, index) => ({
      name: `Server ${index + 1}`,
      id: c.Id
    }));
}

async function collectStats() {
  try {
    const containers = await getAnalyticsContainers();

    const results = {};

    await Promise.all(
      containers.map(async (c) => {
        try {
          const container = docker.getContainer(c.id);

          // 🔍 inspect container for status + limits
          const info = await container.inspect();
          const isRunning = info.State.Running;

          const cpuLimitNano = info.HostConfig.NanoCpus || 0;
          const cpuLimit = cpuLimitNano > 0 ? cpuLimitNano / 1e9 : null;

          const memoryLimitBytes = info.HostConfig.Memory || 0;
          const memoryLimitMB = memoryLimitBytes
            ? Math.round(memoryLimitBytes / 1024 / 1024)
            : null;

          // ❌ if container is stopped, skip stats
          if (!isRunning) {
            results[c.name] = {
              status: 'stopped',
              cpuPercent: 0,
              memoryPercent: 0,
              cpuLimit,
              memoryLimitMB
            };
            return;
          }

          const stats = await container.stats({ stream: false });

          // ======================
          // CPU CALCULATION
          // ======================
          const cpuDelta =
            stats.cpu_stats.cpu_usage.total_usage -
            stats.precpu_stats.cpu_usage.total_usage;

          const systemDelta =
            stats.cpu_stats.system_cpu_usage -
            stats.precpu_stats.system_cpu_usage;

          const cpuCores = stats.cpu_stats.online_cpus || 1;

          let cpuPercent = 0;
          if (systemDelta > 0 && cpuDelta > 0) {
            cpuPercent = (cpuDelta / systemDelta) * cpuCores * 100;
          }

          // ======================
          // MEMORY CALCULATION
          // ======================
          const memoryUsage = stats.memory_stats.usage || 0;
          const memoryLimit = stats.memory_stats.limit || 1;

          results[c.name] = {
            status: 'running',

            cpuPercent: Number(cpuPercent.toFixed(2)),
            cpuCores,
            cpuLimit, // from docker-compose (cpus: 2)

            memoryPercent: Number(((memoryUsage / memoryLimit) * 100).toFixed(2)),
            memoryUsageMB: Math.round(memoryUsage / 1024 / 1024),
            memoryLimitMB: Math.round(memoryLimit / 1024 / 1024),

            memoryLimitConfiguredMB: memoryLimitMB // from docker-compose
          };

        } catch (err) {
          results[c.name] = {
            status: 'error',
            error: err.message
          };
        }
      })
    );

    parentPort.postMessage({
      timestamp: Date.now(),
      servers: results
    });

  } catch (err) {
    parentPort.postMessage({ error: err.message });
  }
}

// run every 1 sec
setInterval(collectStats, 1000);