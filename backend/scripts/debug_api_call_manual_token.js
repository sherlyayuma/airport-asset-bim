const http = require('http');
const jwt = require('jsonwebtoken');

const secret = 'airport_asset_secret_2026';
const token = jwt.sign({ id: 1, role: 'admin' }, secret, { expiresIn: '1h' });

console.log('Generated Token:', token);

function fetchAssets(token) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/assets?page=1&limit=10',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req = http.request(options, (res) => {
        console.log(`ASSETS API STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('ASSETS API BODY PREVIEW:');
            console.log(data.substring(0, 500));
            try {
                const json = JSON.parse(data);
                console.log('✅ Body is valid JSON');
                if (json.success) {
                    console.log('Assets count in response:', json.assets?.length);
                } else {
                    console.log('❌ API returned success: false', json.message);
                }
            } catch (e) {
                console.log('❌ Body is INVALID JSON');
                console.log('Raw Body:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Assets request failed: ${e.message}`);
    });

    req.end();
}

fetchAssets(token);
