const http = require('http');
const jwt = require('jsonwebtoken');

const secret = 'airport_asset_secret_2026';
const token = jwt.sign({ id: 1, role: 'admin' }, secret, { expiresIn: '1h' });

const ASSET_ID_TO_TEST = 72; // From previous debug output

function makeRequest(path, label) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`\n--- ${label} ---`);
            console.log(`Status: ${res.statusCode}`);
            try {
                const json = JSON.parse(data);
                if (path.includes('dashboard')) {
                    console.log('Stats Check:', json.stats ? '✅ Present' : '❌ Missing');
                    console.log('RecentActivity Check:', json.recentActivity ? '✅ Present' : '❌ Missing');
                    if (json.stats) console.log('Stats keys:', Object.keys(json.stats));
                } else if (path.includes('view')) {
                    console.log('Asset Check:', json.asset ? '✅ Present' : '❌ Missing');
                    if (json.asset) console.log('Asset Name:', json.asset.nama);
                }
            } catch (e) {
                console.log('❌ Invalid JSON');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`${label} failed: ${e.message}`);
    });

    req.end();
}

console.log('Testing Dashboard and Detail Endpoints...');
makeRequest('/api/dashboard/data', 'Dashboard Data');
makeRequest(`/api/assets/view/${ASSET_ID_TO_TEST}`, 'Asset Detail');
