const db = require('../config/db');

exports.findByPhone = async (phone) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE phone = ?', [phone]);
  return rows[0];
};

exports.registerUser = async (phone, name, dob, email) => {
  const [result] = await db.execute('INSERT INTO users (phone, name, dob, email) VALUES (?, ?, ?, ?)', [phone, name, dob, email]);
  return result.insertId;
};