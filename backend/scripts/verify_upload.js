const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    try {
        // Create dummy images
        for (let i = 1; i <= 5; i++) {
            fs.writeFileSync(`test_image_${i}.png`, 'fake image content');
        }

        const form = new FormData();
        form.append('nama', 'Test Asset Limit');
        form.append('description', 'Testing upload limit');
        form.append('kategori', 'Elektronik');
        form.append('asset_no', '999999999999'); // Validation might require 12 digits

        // Append 5 images (Limit is 20, so 5 should work. Old limit was 3)
        for (let i = 1; i <= 5; i++) {
            form.append('images', fs.createReadStream(`test_image_${i}.png`));
        }

        // We need an admin token. Assuming there's a way to get one or bypass auth for test,
        // OR we use the login endpoint first.
        // Let's try to login first.

        // NOTE: This script assumes the server is running on localhost:3000
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'admin123' // Default? We need to know this.
        });

        const token = loginRes.data.token;
        console.log('Logged in, token obtained.');

        const config = {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        };

        const response = await axios.post('http://localhost:3000/api/assets/add', form, config);

        console.log('Upload status:', response.status);
        console.log('Upload response:', response.data);

        if (response.data.success) {
            console.log('SUCCESS: Uploaded 5 images successfully!');
        } else {
            console.log('FAILED: ' + response.data.message);
        }

    } catch (error) {
        if (error.response) {
            console.error('Error Response:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        // Cleanup
        for (let i = 1; i <= 5; i++) {
            try { fs.unlinkSync(`test_image_${i}.png`); } catch (e) { }
        }
    }
}

testUpload();
