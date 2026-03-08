const fs = require('fs');
const src = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\988f7f19-a6d9-45f8-8fd0-1012560932fe\\media__1771816671491.jpg';
const dst = 'logo_b64.txt';

try {
    const data = fs.readFileSync(src);
    const b64 = data.toString('base64');
    fs.writeFileSync(dst, b64);
    console.log('SUCCESS: Base64 generated');
} catch (err) {
    console.error('ERROR:', err.message);
}
