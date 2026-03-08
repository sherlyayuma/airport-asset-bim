const BASE_URL = 'http://localhost:3001/api';
let token = '';

async function runTests() {
    try {
        console.log('--- START DECIMAL QUANTITY VERIFICATION ---');

        // 1. Login
        console.log('\n1. Testing Login...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Asset Management',
                password: 'Angkasapura001'
            })
        });
        const loginData = await loginRes.json();
        if (loginData.success) {
            token = loginData.data.token;
            console.log('✅ Login Success');
        } else {
            console.error('❌ Login Failed');
            return;
        }

        // 2. Add Asset with Decimal Quantity
        console.log('\n2. Testing Add Asset with Decimal Quantity (2.34)...');

        const form = new FormData();
        form.append('nama', 'Test Decimal Asset ' + Date.now());
        form.append('kategori', 'Elektronik'); // Required field
        form.append('quantity', '2,34');
        form.append('location_id', '1');

        // Attempting to use native fetch with FormData
        const addRes = await fetch(`${BASE_URL}/assets/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: form
        });

        let addData;
        const textParams = await addRes.text();
        try {
            addData = JSON.parse(textParams);
        } catch (e) {
            console.error('❌ Failed to parse JSON response:', textParams);
            return;
        }

        if (addData.success) {
            console.log('✅ Add Asset Success');
            console.log('Quantity Returned:', addData.data.quantity);
            if (addData.data.quantity === 2.34) {
                console.log('✅ Quantity Correct (2.34)');
            } else {
                console.log('❌ Quantity Incorrect:', addData.data.quantity);
            }
        } else {
            console.error('❌ Add Asset Failed. Status:', addRes.status);
            console.error('Response:', JSON.stringify(addData, null, 2));
        }

        console.log('\n--- END VERIFICATION ---');

    } catch (err) {
        console.error('Global Error:', err);
    }
}

runTests();
