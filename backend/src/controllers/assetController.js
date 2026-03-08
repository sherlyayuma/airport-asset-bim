const path = require('path');
const fs = require('fs');
const Asset = require('../models/Asset');
const AssetLog = require('../models/AssetLog');
const { generateBarcode } = require('../utils/barcodeGenerator');

const addAsset = async (req, res, next) => {
  try {
    // Basic defaults
    const nama = req.body.nama || '-';
    const description = req.body.description || '';
    // const kategori = req.body.kategori || '-';
    const tanggal_beli = req.body.tanggal_beli || req.body.cap_date || new Date().toISOString().split('T')[0];

    // Handle Multiple Images
    let image = null;
    if (req.files && req.files.length > 0) {
      const paths = req.files.map(f => {
        // Path should be relative to the 'backend' folder
        const relativePath = path.relative(path.join(__dirname, '../../'), f.path).replace(/\\/g, '/');
        return `/${relativePath}`;
      });
      image = JSON.stringify(paths);
    }

    const year = new Date().getFullYear();
    const lastAsset = await Asset.getLastByYear(year);
    const nextNumber = lastAsset ? parseInt(lastAsset.asset_id.split('-')[2]) + 1 : 1;
    const asset_id = `AS-${year}-${String(nextNumber).padStart(4, '0')}`;

    console.log(`Generating barcode for ${asset_id}`);
    const barcodePath = await generateBarcode(asset_id);

    const assetData = {
      ...req.body,
      asset_id,
      nama,
      description,
      // kategori,
      tanggal_beli,
      image_path: image,
      barcode: barcodePath,

      quantity: parseFloat(String(req.body.quantity).replace(',', '.')) || 0,
      acquis_val: parseFloat(req.body.acquis_val) || 0,
      accum_dep: parseFloat(req.body.accum_dep) || 0,
      book_val: parseFloat(req.body.book_val) || 0,
      monthly_dep: parseFloat(req.body.monthly_dep) || 0,

      odep_start: req.body.odep_start || null,
      cap_date: req.body.cap_date || null
    };

    const newAsset = await Asset.create(assetData);
    await AssetLog.create(newAsset.id, req.adminId, `Aset ${asset_id} ditambahkan`);

    res.status(201).json({
      success: true,
      message: 'Aset berhasil ditambahkan',
      data: newAsset
    });
  } catch (err) {
    next(err);
  }
};

const getAssets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'newest';
    const offset = (page - 1) * limit;

    const filters = {
      // kategori: req.query.kategori || null,
      kondisi: req.query.kondisi || null,
      tipe: req.query.tipe || null,
      lokasi: req.query.lokasi || null,
      location_id: req.query.location_id || null,
      search: req.query.search || null
    };

    const assets = await Asset.getAll(filters, sort, limit, offset);
    const total = await Asset.countAll(filters);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      assets,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
};

const getAssetById = async (req, res, next) => {
  try {
    let asset;
    asset = await Asset.findById(req.params.id);
    if (!asset) {
      asset = await Asset.findByAssetId(req.params.id);
    }
    if (!asset) {
      asset = await Asset.findByNama(req.params.id);
    }

    if (!asset) {
      const error = new Error('Aset tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const logs = await AssetLog.getByAssetId(asset.id);
    res.json({
      success: true,
      asset: {
        ...asset,
        logs
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      const error = new Error('Aset tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const oldData = { ...asset };
    let storedImages = [];
    try {
      if (oldData.image_path) {
        if (oldData.image_path.trim().startsWith('[')) {
          storedImages = JSON.parse(oldData.image_path);
        } else {
          storedImages = [oldData.image_path];
        }
      }
    } catch (e) {
      storedImages = oldData.image_path ? [oldData.image_path] : [];
    }

    if (req.body.deleted_images) {
      let toDelete = [];
      try {
        toDelete = JSON.parse(req.body.deleted_images);
      } catch (e) {
        if (Array.isArray(req.body.deleted_images)) toDelete = req.body.deleted_images;
        else toDelete = [req.body.deleted_images];
      }
      storedImages = storedImages.filter(img => !toDelete.includes(img));
    }

    if (req.files && req.files.length > 0) {
      const newPaths = req.files.map(f => {
        const relativePath = path.relative(path.join(__dirname, '../../'), f.path).replace(/\\/g, '/');
        return `/${relativePath}`;
      });
      storedImages = [...storedImages, ...newPaths];
    }

    const image = storedImages.length > 0 ? JSON.stringify(storedImages) : null;

    const updateData = {
      ...req.body,
      image_path: image,
      // In addAsset
      quantity: parseFloat(String(req.body.quantity).replace(',', '.')) || 0,

      // In updateAsset (around line 177)
      quantity: req.body.quantity !== undefined ? (parseFloat(String(req.body.quantity).replace(',', '.')) || 0) : oldData.quantity,
      acquis_val: req.body.acquis_val !== undefined ? (parseFloat(req.body.acquis_val) || 0) : oldData.acquis_val,
      accum_dep: req.body.accum_dep !== undefined ? (parseFloat(req.body.accum_dep) || 0) : oldData.accum_dep,
      book_val: req.body.book_val !== undefined ? (parseFloat(req.body.book_val) || 0) : oldData.book_val,
      monthly_dep: req.body.monthly_dep !== undefined ? (parseFloat(req.body.monthly_dep) || 0) : oldData.monthly_dep,
      odep_start: req.body.odep_start || oldData.odep_start,
      cap_date: req.body.cap_date || oldData.cap_date,
      tanggal_beli: req.body.tanggal_beli || oldData.tanggal_beli,
      location_id: req.body.location_id !== undefined ? req.body.location_id : oldData.location_id
    };

    const finalData = {
      ...oldData,
      ...req.body,
      ...updateData,
      asset_id: oldData.asset_id,
      description: req.body.description !== undefined ? req.body.description : oldData.description
    };

    const updated = await Asset.update(req.params.id, finalData);
    if (!updated) {
      const error = new Error('Gagal update aset');
      error.statusCode = 400;
      throw error;
    }

    let aksi = `Update aset ${asset.asset_id}`;
    if (req.body.kondisi && req.body.kondisi !== oldData.kondisi) {
      aksi += `: kondisi diubah dari ${oldData.kondisi} ke ${req.body.kondisi}`;
    }
    await AssetLog.create(asset.id, req.adminId, aksi);

    res.json({
      success: true,
      message: 'Aset berhasil diperbarui'
    });
  } catch (err) {
    next(err);
  }
};

const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      const error = new Error('Aset tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const deleted = await Asset.deleteById(req.params.id);
    if (!deleted) {
      const error = new Error('Gagal menghapus aset');
      error.statusCode = 400;
      throw error;
    }

    res.json({
      success: true,
      message: 'Aset berhasil dihapus'
    });
  } catch (err) {
    next(err);
  }
};

const downloadBarcode = async (req, res, next) => {
  try {
    const asset = await Asset.findByAssetId(req.params.id);
    if (!asset) {
      const error = new Error('Aset tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    let barcodePath = asset.barcode;
    if (!barcodePath) {
      // Generate if missing
      barcodePath = await generateBarcode(asset.asset_id);
    }

    // Try multiple possible paths for robustness
    const possiblePaths = [];

    // 1. Path as stored in DB (relative to backend/)
    if (barcodePath.startsWith('/')) {
      possiblePaths.push(path.join(__dirname, '../../', barcodePath));
    } else {
      possiblePaths.push(path.join(__dirname, '../../barcodes', barcodePath));
    }

    // 2. Flat fallback (root of barcodes folder)
    const filename = path.basename(barcodePath);
    possiblePaths.push(path.join(__dirname, '../../barcodes', filename));

    // 3. Legacy public folder check (if any)
    possiblePaths.push(path.join(__dirname, '../../public/barcodes', filename));

    let foundPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      // Regenerate if absolutely not found
      console.log(`Barcode file not found for ${asset.asset_id}, regenerating...`);
      const newPath = await generateBarcode(asset.asset_id);
      foundPath = path.join(__dirname, '../../', newPath);
    }

    res.download(foundPath);
  } catch (err) {
    next(err);
  }
};



const downloadQrZip = async (req, res, next) => {
  const { location_id } = req.query;
  if (!location_id) {
    const error = new Error('Location ID required');
    error.statusCode = 400;
    return next(error);
  }

  try {
    // 1. Get Assets by Location
    const assets = await Asset.getAll({ location_id }, 1000, 0);
    if (assets.length === 0) {
      const error = new Error('No assets found for this location');
      error.statusCode = 404;
      throw error;
    }

    // 2. Prepare Temp Dir
    const tempDir = path.join(__dirname, '../../public/temp_zip_' + Date.now());
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // 3. Copy files
    const validFiles = [];
    for (const asset of assets) {
      if (!asset.barcode) continue;
      let barcodePath = asset.barcode;
      if (!barcodePath.includes('/')) {
        barcodePath = '/barcodes/' + barcodePath;
      }

      const srcPath = path.join(__dirname, '../../public', barcodePath);
      if (fs.existsSync(srcPath)) {
        const destPath = path.join(tempDir, `${asset.asset_id}.png`);
        fs.copyFileSync(srcPath, destPath);
        validFiles.push(destPath);
      }
    }

    if (validFiles.length === 0) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      const error = new Error('No QR codes found');
      error.statusCode = 404;
      throw error;
    }

    // 4. Zip using PowerShell
    const zipPath = path.join(__dirname, `../../public/temp_zip_${Date.now()}.zip`);
    const psCommand = `powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}'"`;

    require('child_process').exec(psCommand, (error, stdout, stderr) => {
      fs.rmSync(tempDir, { recursive: true, force: true });

      if (error) {
        console.error(`exec error: ${error}`);
        const err = new Error('Zip generation failed');
        return next(err);
      }

      res.download(zipPath, `QR_Codes_Location_${location_id}.zip`, (err) => {
        if (err) console.error(err);
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      });
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  addAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  downloadBarcode,
  downloadBarcode,
  downloadQrZip
};