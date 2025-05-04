const db = require('../config/db');

exports.saveOTP = async (phone, otp, expiry) => {
  await db.execute(`
  INSERT INTO otps (phone, otp, expiry)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE otp = VALUES(otp), expiry = VALUES(expiry)
`, [phone, otp, expiry]);
};

exports.getOTP = async (phone) => {
  const [rows] = await db.execute('SELECT * FROM otps WHERE phone = ?', [phone]);
  return rows[0];
};