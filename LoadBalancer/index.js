const express = require('express');
const httpProxy = require('http-proxy');
const { RoundRobin } = require('./Algorithms');
const app = express();
const { Worker } = require('worker_threads');
const path = require('path');
const cors = require('cors')

const proxy = httpProxy.createProxyServer({});
const PORT = 3000;

const SERVERS = [
    { name: 'Server 1', port: 5000 }, // ID 0
    { name: 'Server 2', port: 5001 }, // ID 1
    { name: 'Server 3', port: 5002 }  // ID 2
];

let metricsCache = {
    timestamp: null,
    servers: {}
}

app.use(cors())

//starting the worker 
const worker = new Worker(path.join(__dirname, 'worker.js'));

// Listen for messages from the worker
worker.on('message', (data) => {
    if (data)
        metricsCache = data


});

worker.on('error', (error) => {
    console.log(error)
    metricsCache = {
        timestamp: null,
        servers: {}
    }
})
// Error handling to keep the gateway alive
proxy.on('error', (err, req, res) => {
    res.status(502).send({ message: 'Target server unreachable', error: err.message });
});

app.use('/api/:serverId', (req, res) => {
    const serverId = parseInt(req.params.serverId);
    const targetServer = SERVERS[serverId];

    if (!targetServer) {
        return res.status(404).json({ message: 'Server ID not found' });
    }

    const subPath = req.originalUrl.replace(`/api/${serverId}`, '');

    req.url = subPath; // 🔥 important trick

    console.log(`→ ${targetServer.name} ${subPath}`);


    proxy.web(req, res, {
        target: `http://localhost:${targetServer.port}`,
        changeOrigin: true
    });
});

app.use('/optimized/:algoID', (req, res) => {
    const algoID = parseInt(req.params.algoID);

    let targetServer;
    switch (algoID) {
        case 0:
            targetServer = RoundRobin(SERVERS);
            break;

        default:
            return res.status(400).json({ message: 'Invalid algorithm ID' });

    }

    const subPath = req.originalUrl.replace(`/optimized/${algoID}`, '');

    req.url = subPath; // 🔥 important trick
    console.log(`→ ${targetServer.name} ${subPath} (Algorithm: ${algoID})`);
    proxy.web(req, res, {
        target: `http://localhost:${targetServer.port}`,
        changeOrigin: true
    });
});

// helper: get all analytics containers dynamically
async function getAnalyticsContainers() {
    const containers = await docker.listContainers();

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

// GET /usage
app.get('/usage', async (req, res) => {
    if (!metricsCache.timestamp) {
        return res.json({
            message: "metrics is not yet ready"
        })
    }

    res.json({
        ...metricsCache,
        ageMs: Date.now() - metricsCache.timestamp
    })
});


app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
});