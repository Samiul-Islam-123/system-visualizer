
let currentIndex = 0;

function RoundRobin(SERVERS) {
    const currentServer = SERVERS[currentIndex];
    console.log(`Forwarding request to ${currentServer.name} on port ${currentServer.port}`);
    currentIndex = (currentIndex + 1) % SERVERS.length;
    return currentServer;
}

module.exports = {
    RoundRobin
};