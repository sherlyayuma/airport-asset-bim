const { body, validationResult } = require('express-validator');

const validateAsset = [
    body('nama').notEmpty().withMessage('Nama aset wajib diisi'),
    body('nama').notEmpty().withMessage('Nama aset wajib diisi'),
    // body('kategori').notEmpty().withMessage('Kategori wajib diisi'), // REMOVED
    body('kondisi').optional().isIn(['Baik', 'Rusak', 'Hilang', 'Perbaikan']).withMessage('Kondisi tidak valid'),
    body('quantity').optional().custom((val) => {
        if (!val) return true;
        const num = parseFloat(String(val).replace(',', '.'));
        return !isNaN(num);
    }).withMessage('Quantity harus angka'),

    body('acquis_val').optional().isNumeric().withMessage('Nilai akuisisi harus angka'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Delete uploaded files if validation fails to avoid trash
            if (req.files) {
                const fs = require('fs');
                req.files.forEach(f => {
                    try { fs.unlinkSync(f.path); } catch (e) { }
                });
            }
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateAsset };
