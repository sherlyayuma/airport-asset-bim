const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const generateBarcode = async (assetId) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const baseDir = path.join(__dirname, '../../barcodes');
  const relativeDir = path.join(String(year), month);
  const fullDir = path.join(baseDir, relativeDir);

  ensureDir(fullDir);

  const filename = `${assetId}.png`;
  const filePath = path.join(fullDir, filename);

  // URL to encode - Using env var or default
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/detail-aset.html?id=${assetId}`;

  try {
    const png = await bwipjs.toBuffer({
      bcid: 'qrcode',
      text: url,
      scale: 5, // Optimized scale
      includetext: false,
      backgroundcolor: 'FFFFFF',
    });
    fs.writeFileSync(filePath, png);

    // Return relative path for DB storage: /barcodes/YYYY/MM/AS-XXXX.png
    return `/barcodes/${year}/${month}/${filename}`;
  } catch (err) {
    console.error('Barcode error:', err);
    throw new Error('Gagal generate barcode');
  }
};

module.exports = { generateBarcode };