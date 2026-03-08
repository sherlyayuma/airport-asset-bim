const http = require('http');

function loginAndFetchAssets() {
    const postData = JSON.stringify({
        username: 'admin',
        password: 'password123'
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            if (res.statusCode !== 200) {
                console.log('Login failed with status:', res.statusCode);
                console.log('Body:', data);
                return;
            }
            try {
                const json = JSON.parse(data);
                const token = json.data?.token || json.token;
                if (!token) {
                    console.log('Token not found in login response');
                    return;
                }
                console.log('Login successful. Token obtained.');
                fetchAssets(token);
            } catch (e) {
                console.error('Error parsing login response:', e.message);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Login request failed: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

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
            console.log(data.substring(0, 500)); // Print first 500 chars to see if HTML or JSON
            try {
                JSON.parse(data);
                console.log('✅ Body is valid JSON');
            } catch (e) {
                console.log('❌ Body is INVALID JSON');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Assets request failed: ${e.message}`);
    });

    req.end();
}

loginAndFetchAssets();
