
exports.encrypt = (text) => {
  let shift = Number(process.env.ENCRYPTION_SHIFT);
  return text
    .split('')
    .map(char => String.fromCharCode(char.charCodeAt(0) + shift))
    .join('');
}

exports.decrypt = (encryptedText) => {
  let shift = Number(process.env.ENCRYPTION_SHIFT);
  return encryptedText
    .split('')
    .map(char => String.fromCharCode(char.charCodeAt(0) - shift))
    .join('');
}
