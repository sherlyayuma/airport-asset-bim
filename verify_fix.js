
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = 3000;
const TEST_FILE = 'antigravity_test_image.png';
const UPLOADS_DIR = path.join(__dirname, 'backend', 'uploads');
const BARCODES_DIR = path.join(__dirname, 'backend', 'barcodes');

async function testFix() {
    console.log('--- Starting Verification ---');
    
    // 1. Create a test file in the flat root
    const testFilePath = path.join(UPLOADS_DIR, TEST_FILE);
    fs.writeFileSync(testFilePath, 'fake-image-content');
    console.log(`Created test file at: ${testFilePath}`);

    try {
        // 2. Request the file via a nested path
        // The fallback should find it at the root
        const nestedUrl = `http://localhost:${PORT}/uploads/2026/03/${TEST_FILE}`;
        console.log(`Requesting nested URL: ${nestedUrl}`);
        
        const response = await fetchUrl(nestedUrl);
        if (response.statusCode === 200 && response.body === 'fake-image-content') {
            console.log('✅ PASS: Static fallback correctly served the flat file via nested URL.');
        } else {
            console.error(`❌ FAIL: Expected 200 and "fake-image-content", got ${response.statusCode} and "${response.body}"`);
        }

        // 3. Test barcode download API
        const barcodeUrl = `http://localhost:${PORT}/api/assets/barcode/AS-2026-0009`;
        console.log(`Requesting barcode download: ${barcodeUrl}`);
        const barcodeResponse = await fetchUrl(barcodeUrl);
        if (barcodeResponse.statusCode === 200) {
            console.log('✅ PASS: Barcode download API returned 200.');
        } else {
            console.error(`❌ FAIL: Barcode download returned ${barcodeResponse.statusCode}`);
        }

    } catch (err) {
        console.error('Error during test:', err);
    } finally {
        // Cleanup
        if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
        console.log('Cleaned up test file.');
    }
}

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        }).on('error', reject);
    });
}

testFix();
