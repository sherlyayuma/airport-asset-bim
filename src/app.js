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

// View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Static Files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/barcodes', express.static(path.join(__dirname, '../barcodes')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// View Routes
app.get('/', (req, res) => res.render('index'));
app.get('/index', (req, res) => res.render('index'));
app.get('/dashboard', (req, res) => res.render('dashboard'));
app.get('/data-aset', (req, res) => res.render('data-aset'));
app.get('/tambah-aset', (req, res) => res.render('tambah-aset'));
app.get('/detail-aset', (req, res) => res.render('detail-aset'));
app.get('/laporan-aset', (req, res) => res.render('laporan-aset'));
app.get('/cetak-qr', (req, res) => res.render('cetak-qr'));
app.get('/view-qr', (req, res) => res.render('view-qr'));

// Support for .html extensions just in case
app.get('/:page.html', (req, res) => {
    res.render(req.params.page);
});

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
