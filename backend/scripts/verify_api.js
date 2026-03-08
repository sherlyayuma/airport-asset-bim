const BASE_URL = 'http://localhost:3001/api';
let token = '';

async function runTests() {
    try {
        console.log('--- START API VERIFICATION ---');

        // 1. Login (Auth Controller)
        console.log('\n1. Testing Login...');
        try {
            const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'Asset Management',
                    password: 'Angkasapura001'
                })
            });
            const loginData = await loginRes.json();
            console.log('Login Response:', JSON.stringify(loginData, null, 2));

            console.log('✅ Login Success:', loginData.success);
            if (loginData.success) {
                token = loginData.data.token;
            } else {
                console.log('❌ Login Failed Message:', loginData.message);
            }
        } catch (e) {
            console.error('❌ Login Failed:', e.message);
        }

        if (!token) {
            console.log('Skipping protected tests due to login failure.');
            return;
        }

        const authHeader = { 'Authorization': `Bearer ${token}` };

        // 2. Get Assets (Asset Controller - List Standard)
        console.log('\n2. Testing Get Assets...');
        try {
            const assetsRes = await fetch(`${BASE_URL}/assets`, { headers: authHeader });
            const data = await assetsRes.json();

            if (data.success && Array.isArray(data.data) && data.pagination) {
                console.log('✅ Get Assets Format Correct');
                console.log(`   Total: ${data.pagination.total}, Page: ${data.pagination.page}`);
            } else {
                console.log('❌ Get Assets Query Format Invalid:', JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.error('❌ Get Assets Failed:', e.message);
        }

        // 3. Get Locations (Location Controller - List Standard)
        console.log('\n3. Testing Get Locations...');
        try {
            const locRes = await fetch(`${BASE_URL}/locations`, { headers: authHeader });
            const data = await locRes.json();

            if (data.success && Array.isArray(data.data)) {
                console.log('✅ Get Locations Format Correct');
            } else {
                console.log('❌ Get Locations Format Invalid:', JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.error('❌ Get Locations Failed:', e.message);
        }

        // 4. Dashboard Stats (Dashboard Controller)
        console.log('\n4. Testing Dashboard Stats...');
        try {
            const dashRes = await fetch(`${BASE_URL}/dashboard/stats`, { headers: authHeader });
            const data = await dashRes.json();

            if (data.success && data.data && data.data.stats) {
                console.log('✅ Dashboard Stats Format Correct');
            } else {
                console.log('❌ Dashboard Stats Format Invalid:', JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.error('❌ Dashboard Stats Failed:', e.message);
        }

        // 5. Error Handling (404)
        console.log('\n5. Testing 404 Error...');
        try {
            const errRes = await fetch(`${BASE_URL}/assets/view/99999999`, { headers: authHeader });
            const data = await errRes.json();

            if (errRes.status === 404 && data.success === false) {
                console.log('✅ 404 Error Format Correct');
            } else {
                console.log('❌ 404 Error Format Invalid:', JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.error('❌ 404 Test Failed:', e.message);
        }

        console.log('\n--- END VERIFICATION ---');

    } catch (err) {
        console.error('Global Error:', err);
    }
}

runTests();
