try {
    require('express-validator');
    console.log('✅ express-validator is installed');
} catch (e) {
    console.error('❌ express-validator is NOT installed');
    process.exit(1);
}
