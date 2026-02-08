const http = require('http');

const postEvent = (data) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/analytics/event',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, (res) => {
            res.on('data', () => { });
            res.on('end', () => resolve(res.statusCode));
        });
        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
};

const queryParams = (params) => {
    return Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
}

const getQuery = (params) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/analytics/query?' + queryParams(params),
            method: 'GET'
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.end();
    });
};

const run = async () => {
    console.log("Starting Verification...");

    // Ingest 1000 unique events
    const metric = 'test_metric';
    const dimension = 'test_dim';

    console.log("Ingesting 100 events...");
    const promises = [];
    for (let i = 0; i < 100; i++) {
        promises.push(postEvent({ metric, dimension, value: `user_${i}` }));
    }

    await Promise.all(promises);
    console.log("Ingestion requests sent.");

    console.log("Waiting for buffer flush (6s)...");
    await new Promise(r => setTimeout(r, 6000));

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    console.log("Querying...");
    const result = await getQuery({ metric, dimension, start, end });

    console.log("Result:", result);

    if (result.count >= 95 && result.count <= 105) {
        console.log("SUCCESS: Count is within expected range (approx 100).");
    } else {
        console.log("FAILURE: Count is off or 0.");
    }
};

run().catch(console.error);
