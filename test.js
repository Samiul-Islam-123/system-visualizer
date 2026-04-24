const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/optimized/0/analytics/heavy/deep-insights';

//  const API_BASE_URL = 'http://localhost:5000/analytics/moderate/revenue-by-state';

async function MakeRequest(url) {
    const startTime = Date.now();
    try {
        const response = await axios.get(url, { timeout: 10000 });
        const endTime = Date.now();
        console.log(`Request to ${url} took ${endTime - startTime} ms`);
        return response.data;
    }
    catch (err) {
        const endTime = Date.now();
        console.log(`Request to ${url} failed after ${endTime - startTime} ms`);
        throw err;
    }
}

async function main() {
    try {

        

        setInterval(async () => {
            try {
                console.log('Making request to deep insights endpoint...');
                const result = await MakeRequest(API_BASE_URL);
                console.log('Result for deep insights:', result);
            }
                catch (err) {
                console.error('Error fetching deep insights:', err);
            }
        }, 1000);
    } catch (err) {
        console.error('Error fetching deep insights:', err);
    }
}

main();
