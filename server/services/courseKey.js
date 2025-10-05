const crypto = require('crypto');

function newAccessKey(ttlMinutes = 45) {
  return {
    code: crypto.randomBytes(4).toString('hex').toUpperCase(), // e.g., 8 hex chars
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
  };
}

function isKeyValid(course, code) {
  const k = course?.currentAccessKey;
  return !!k && k.code === code && k.expiresAt > new Date();
}

module.exports = { newAccessKey, isKeyValid };
