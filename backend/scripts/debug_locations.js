const http = require('http');
const jwt = require('jsonwebtoken');

const secret = 'airport_asset_secret_2026';
const token = jwt.sign({ id: 1, role: 'admin' }, secret, { expiresIn: '1h' });

function makeRequest() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/locations',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`\n--- Locations Endpoint ---`);
            console.log(`Status: ${res.statusCode}`);
            try {
                const json = JSON.parse(data);
                console.log('Locations Check:', json.locations ? '✅ Present' : '❌ Missing');
                if (json.locations) {
                    console.log('Is Array:', Array.isArray(json.locations));
                    console.log('Count:', json.locations.length);
                    if (json.locations.length > 0) {
                        console.log('First Location:', json.locations[0]);
                    }
                }
            } catch (e) {
                console.log('❌ Invalid JSON');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Request failed: ${e.message}`);
    });

    req.end();
}

console.log('Testing Locations Endpoint...');
makeRequest();
