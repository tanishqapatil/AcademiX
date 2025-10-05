const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const header = req.header('Authorization');
  if (!header) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const token = header.split(' ')[1]; // safer
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error', err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};
