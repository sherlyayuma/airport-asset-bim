const Asset = require('../models/Asset');

const getDashboardData = async (req, res, next) => {
    try {
        // stats returns { total, baik, rusak } from Asset.getStats
        // We might want to enhance Asset.getStats or just use it as is.
        // The previous controller had `getStats` which fetched stats and recent assets.
        // The implementation I overwrote it with was efficient but custom.
        // Let's rely on the previous logic structure but standardized.

        // 1. Stats
        // Asset.getStats() currently returns { total, baik, rusak }
        // We can add more if needed or just use what it gives.
        // Wait, I saw Asset.getStats implementation:
        // SELECT COUNT(id) as total, SUM(...) as baik, SUM(...) as rusak
        // It's basic. I'll stick to it for now but maybe enhance it if needed.

        const stats = await Asset.getStats();

        // 2. Recent Assets
        // Reuse getAll
        const recentAssets = await Asset.getAll({}, 'date_desc', 10, 0);

        res.json({
            success: true,
            stats: {
                total: stats.total || 0,
                baik: stats.baik || 0,
                rusak: stats.rusak || 0
            },
            recentActivity: recentAssets
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardData };