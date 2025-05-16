 // backend/middleware/admin-auth.js
const jwt = require('jsonwebtoken');


function adminAuth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Not an admin.' });
    }
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
}

module.exports = adminAuth;




//  // backend/middleware/adminAuth.js
// const jwt = require('jsonwebtoken');
// const config = require('config');

// const adminAuth = (req, res, next) => {
//   const authHeader = req.header('Authorization');
//   if (!authHeader) {
//     return res.status(401).json({ message: 'Access Denied. No token provided.' });
//   }
//   const token = authHeader.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ message: 'Access Denied. Invalid token format.' });
//   }
//   try {
//     const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
//     if (decoded.role !== 'admin') {
//       return res.status(403).json({ message: 'Access Denied. Not an admin.' });
//     }
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(400).json({ message: 'Invalid token.' });
//   }
// };

// module.exports = adminAuth;