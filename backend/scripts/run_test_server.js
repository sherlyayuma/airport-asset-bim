const { spawn } = require('child_process');

console.log('--- Launching Test Server on Port 3001 ---');

const server = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: '3001' },
    stdio: 'pipe' // Pipe stdout to detect startup
});

server.stdout.on('data', (data) => {
    console.log(`[SERVER]: ${data}`);
    // Check for startup message
    if (data.toString().includes('Server running')) {
        console.log('--- Server Started. Running Verification ---');
        runVerification();
    }
});

server.stderr.on('data', (data) => {
    console.error(`[SERVER ERROR]: ${data}`);
});

function runVerification() {
    const scriptToRun = process.argv[2] || 'verify_api.js';
    const verify = spawn('node', [scriptToRun], {
        stdio: 'inherit'
    });

    verify.on('close', (code) => {
        console.log(`--- Verification Finished with code ${code} ---`);
        server.kill(); // Kill the server
        process.exit(code);
    });
}

// Fallback timeout if stdout detection fails
setTimeout(() => {
    // verify.js will be run by stdout listener, but if it hangs:
    // console.log('Timeout fallback...');
}, 5000);
