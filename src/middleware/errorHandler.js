const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Default error status and message
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || null;

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
    }

    // Handle Multer error
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File too large. Max size is 2MB';
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
        // Only show stack in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
