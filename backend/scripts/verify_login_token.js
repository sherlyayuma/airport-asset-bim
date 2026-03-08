const http = require('http');

function verifyLogin() {
    const postData = JSON.stringify({
        username: 'admin', // Adjust if needed
        password: 'password123' // Adjust if needed
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
        console.log(`STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log('RESPONSE:', JSON.stringify(json, null, 2));

                if (json.data && json.data.token) {
                    console.log('✅ Token found at data.data.token');
                } else if (json.token) {
                    console.log('⚠️ Token found at data.token');
                } else {
                    console.log('❌ Token NOT found');
                }
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                console.log('Raw Data:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

verifyLogin();
