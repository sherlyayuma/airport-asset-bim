const validLogin = async () => {
    const url = 'http://localhost:3000/api/auth/login';
    const credentials = {
        username: 'Asset Management',
        password: 'Angkasapura001'
    };

    try {
        console.log(`Attempting login at ${url} with username '${credentials.username}'...`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Login verified successfully via API!');
            console.log('Token received:', data.token ? 'Yes' : 'No');
            require('fs').writeFileSync('verify_status.txt', 'SUCCESS');
        } else {
            console.error('❌ Login failed!');
            console.error('Status:', response.status);
            console.error('Message:', data.message);
            require('fs').writeFileSync('verify_status.txt', 'FAILED: ' + data.message);
        }
    } catch (error) {
        console.error('❌ Error connecting to API:', error.message);
        require('fs').writeFileSync('verify_status.txt', 'ERROR: ' + error.message);
    }
};

validLogin();
