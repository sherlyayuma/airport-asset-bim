const jwt = require('jsonwebtoken');

const authAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: 'Akses ditolak' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = verified.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
};

module.exports = authAdmin;