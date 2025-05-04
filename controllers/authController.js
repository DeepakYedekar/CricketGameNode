const otpModel = require('../models/otpModel');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { encrypt } = require('../utils/encrypt');

exports.sendOTP = async (req, res) => {
  const { mobile } = req.body;
  const otp = '1234';
  const expiry = moment().add(1, 'minute').valueOf().toString();
  await otpModel.saveOTP(mobile, otp, expiry);
  res.json({ success: true });
};

exports.register = async (req, res) => {
  const { phone, name, dob, email, otp } = req.body;
  const otpData = await otpModel.getOTP(phone);
  if (!otpData || Date.now() > otpData.expiry || otp !== otpData.otp) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }
  const existing = await userModel.findByPhone(phone);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Phone already registered' });
  }
  const userId = await userModel.registerUser(phone, name, dob, email);
  let encrypted = encrypt(userId.toString());
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
  res.json({ success: true, token, encryptedId: encrypted });
};