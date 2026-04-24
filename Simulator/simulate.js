const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/analytics';

const ENDPOINTS = {
  light: ['/light/overview', '/light/revenue'],
  moderate: ['/moderate/revenue-by-state', '/moderate/top-products'],
  heavy: ['/heavy/deep-insights']
};

// 📊 Metrics store
const metrics = {
  total: 0,
  success: 0,
  failed: 0,
  types: {
    light: { count: 0, success: 0, failed: 0, totalTime: 0 },
    moderate: { count: 0, success: 0, failed: 0, totalTime: 0 },
    heavy: { count: 0, success: 0, failed: 0, totalTime: 0 }
  }
};

// 🔀 weighted selector + type
function pickEndpoint(variation) {
  const lightWeight = 0.6 - (variation * 0.3);
  const moderateWeight = 0.3;

  const rand = Math.random();

  if (rand < lightWeight) {
    const ep = ENDPOINTS.light[Math.floor(Math.random() * ENDPOINTS.light.length)];
    return { type: 'light', endpoint: ep };
  } else if (rand < lightWeight + moderateWeight) {
    const ep = ENDPOINTS.moderate[Math.floor(Math.random() * ENDPOINTS.moderate.length)];
    return { type: 'moderate', endpoint: ep };
  } else {
    const ep = ENDPOINTS.heavy[0];
    return { type: 'heavy', endpoint: ep };
  }
}

// 📡 Request
async function MakeRequest(type, url) {
  const start = Date.now();

  try {
    await axios.get(url, { timeout: 5000 });

    const time = Date.now() - start;

    metrics.success++;
    metrics.types[type].success++;
    metrics.types[type].totalTime += time;

  } catch (err) {
    metrics.failed++;
    metrics.types[type].failed++;
  }
}

// 📊 Print metrics
function printStats() {
  console.clear();

  console.log("📊 LIVE METRICS\n");

  console.log(`Total Requests: ${metrics.total}`);
  console.log(`Success: ${metrics.success}`);
  console.log(`Failed: ${metrics.failed}`);
  console.log(`Success Rate: ${(metrics.success / metrics.total * 100 || 0).toFixed(2)}%\n`);

  for (const type in metrics.types) {
    const t = metrics.types[type];

    const avg = t.success ? (t.totalTime / t.success).toFixed(2) : 0;

    console.log(`🔹 ${type.toUpperCase()}`);
    console.log(`   Requests: ${t.count}`);
    console.log(`   Success: ${t.success}`);
    console.log(`   Failed: ${t.failed}`);
    console.log(`   Avg Time: ${avg} ms\n`);
  }
}

// 🚀 CONSTANT TRAFFIC ENGINE
async function startLoadTest(RPS = 10, variation = 0.7, durationSec = 10) {

  console.log(`🔥 Starting Constant Load Test`);
  console.log(`RPS: ${RPS}, Variation: ${variation}, Duration: ${durationSec}s\n`);

  const intervalMs = 1000 / RPS;
  const startTime = Date.now();

  const interval = setInterval(() => {

    const { type, endpoint } = pickEndpoint(variation);
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making request to ${endpoint} [${type}]`);

    metrics.total++;
    metrics.types[type].count++;

    MakeRequest(type, url);

    // stop condition
    if (Date.now() - startTime > durationSec * 1000) {
      clearInterval(interval);
      clearInterval(printer);

      console.log("\n🛑 FINAL REPORT");
      printStats();
    }

  }, intervalMs);

  // print stats every second
  const printer = setInterval(printStats, 1000);
}

// ▶️ RUN
startLoadTest(20, 0.1, 10);