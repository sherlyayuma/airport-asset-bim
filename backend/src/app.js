const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const locationRoutes = require('./routes/locationRoutes');
const scanRoutes = require('./routes/scanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Accommodate both default ports
    credentials: true
}));
app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files (for assets like images and barcodes)
const uploadsDir = path.join(__dirname, '../uploads');
const barcodesDir = path.join(__dirname, '../barcodes');

app.use('/uploads', express.static(uploadsDir));
app.use('/barcodes', express.static(barcodesDir));

// Fallback for flat structure (if nested path fails)
const staticFallback = (baseDir) => (req, res, next) => {
    // If we're here, express.static didn't find the file
    const filename = path.basename(req.path);
    const flatPath = path.join(baseDir, filename);
    
    if (fs.existsSync(flatPath) && fs.lstatSync(flatPath).isFile()) {
        return res.sendFile(flatPath);
    }
    next();
};

app.use('/uploads', staticFallback(uploadsDir));
app.use('/barcodes', staticFallback(barcodesDir));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Handle 404 for API routes
app.use('/api/*', (req, res, next) => {
    const error = new Error('Endpoint not found');
    error.statusCode = 404;
    next(error);
});

// Global Error Handler
const errorHandler = require('./middleware/errorHandler');

// Global Error Handler
app.use(errorHandler);

// Fallback error for non-existent API routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API Endpoint not found' });
});

module.exports = app;
