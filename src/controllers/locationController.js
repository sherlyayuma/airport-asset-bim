const Location = require('../models/Location');

const getAll = async (req, res, next) => {
    try {
        const locations = await Location.getAll();
        res.json({
            success: true,
            locations
        });
    } catch (error) {
        next(error);
    }
};

const addLocation = async (req, res, next) => {
    try {
        const { nama_lokasi } = req.body;
        if (!nama_lokasi) {
            const error = new Error('Nama lokasi wajib diisi');
            error.statusCode = 400;
            throw error;
        }

        // Check if location exists
        const existingLocation = await Location.findByName(nama_lokasi);
        if (existingLocation) {
            const error = new Error('Lokasi sudah ada');
            error.statusCode = 400;
            throw error;
        }

        const result = await Location.create(nama_lokasi);

        res.status(201).json({
            success: true,
            message: 'Lokasi berhasil ditambahkan',
            data: result
        });
    } catch (error) {
        // Double check for race conditions
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062 || (error.message && error.message.includes('Duplicate entry'))) {
            const customError = new Error('Lokasi sudah ada');
            customError.statusCode = 400;
            return next(customError);
        }
        console.error('Add location error:', error);
        next(error);
    }
};

module.exports = { getAll, addLocation };
