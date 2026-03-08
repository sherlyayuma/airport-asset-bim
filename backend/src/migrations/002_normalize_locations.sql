-- 1. Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_lokasi VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add location_id to assets if it doesn't exist
-- Using a stored procedure style block for idempotency in raw SQL is hard without delimiters, 
-- but we'll assume this runs in a flow where we can check or just ignore if exists (or use simple ALTER and ignore error in script)
-- For safety, we'll just run ALTER. If it fails because exists, strict mode might stop it.
-- Let's stick to simple statements. 

ALTER TABLE assets ADD COLUMN location_id INT NULL;

-- 3. Populate locations from existing assets
INSERT IGNORE INTO locations (nama_lokasi)
SELECT DISTINCT lokasi FROM assets WHERE lokasi IS NOT NULL AND lokasi != '' AND lokasi != '-';

-- 4. Update assets.location_id
UPDATE assets a
JOIN locations l ON a.lokasi = l.nama_lokasi
SET a.location_id = l.id;

-- 5. Add Foreign Key
ALTER TABLE assets
ADD CONSTRAINT fk_assets_location
FOREIGN KEY (location_id) REFERENCES locations(id)
ON DELETE SET NULL;
