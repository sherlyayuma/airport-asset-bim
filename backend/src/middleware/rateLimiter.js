const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: {
        success: false,
        message: 'Too many upload attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { uploadLimiter };
