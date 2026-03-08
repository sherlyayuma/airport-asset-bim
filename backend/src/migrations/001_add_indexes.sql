-- Add indexes to optimize queries
ALTER TABLE assets ADD INDEX idx_asset_id (asset_id);
ALTER TABLE assets ADD INDEX idx_created_at (created_at); -- Assuming created_at exists, if not need to check schema
ALTER TABLE assets ADD INDEX idx_nama (nama);
ALTER TABLE assets ADD INDEX idx_kategori (kategori);
ALTER TABLE assets ADD INDEX idx_kondisi (kondisi);
ALTER TABLE assets ADD INDEX idx_lokasi (lokasi);
