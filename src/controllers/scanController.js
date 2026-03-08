const Asset = require('../models/Asset');

const viewAssetPublic = async (req, res, next) => {
  const { id } = req.params; // asset_id like AS-2026-0001
  try {
    const asset = await Asset.findByAssetId(id);
    if (!asset) {
      const error = new Error('Aset tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Standard response
    res.json({
      success: true,
      data: asset
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { viewAssetPublic };