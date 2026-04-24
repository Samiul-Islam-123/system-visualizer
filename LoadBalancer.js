const Algorithms = {
    ROUND_ROBIN: 'ROUND_ROBIN',
    LEAST_CONNECTIONS: 'LEAST_CONNECTIONS',
    IP_HASH: 'IP_HASH'
};

const httpProxy = require('http-proxy');

const REQUESTS = [];

class LoadBalancer {
    constructor(servers) {
        this.servers = servers;
        this.currentAlgorithm = Algorithms.ROUND_ROBIN;
        this.currentIndex = 0;
        this.proxy = httpProxy.createProxyServer({});
    }

    handleRequest(req, res) {
        REQUESTS.push(req);
        switch (this.currentAlgorithm) {
            case Algorithms.ROUND_ROBIN:
                this.RoundRobin(req,res);
                break;
        }
    }

    RoundRobin(req,res){
        const server = this.servers[this.currentIndex];
        console.log(`Forwarding request to ${server.name} on port ${server.port}`);
        this.currentIndex = (this.currentIndex + 1) % this.servers.length;
        //proxying logic 
        this.proxy.web(req, res, { target: `http://localhost:${server.port}` });
    }
}

module.exports = LoadBalancer;