 const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log
    if (!decoded._id) {
      return res.status(400).json({ message: 'Invalid token: User ID missing.' });
    }
    req.user = {_id: decoded._id, isAdmin: decoded.isAdmin || false }; // Include isAdmin
    next();
  } catch (ex) {
    console.error('Token verification error:', ex.message); // Debug log
    res.status(400).json({ message: 'Invalid token.' });
  }
}

module.exports = auth;