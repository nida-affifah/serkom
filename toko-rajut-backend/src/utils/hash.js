const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash password dengan bcrypt
 * @param {string} plainPassword - password asli
 * @returns {Promise<string>} hash password
 */
async function hashPassword(plainPassword) {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Bandingkan password asli dengan hash
 * @param {string} plainPassword - password asli dari input user
 * @param {string} hashedPassword - hash dari database
 * @returns {Promise<boolean>} true kalau cocok
 */
async function comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Cek apakah string sudah hash bcrypt
 * @param {string} str
 * @returns {boolean}
 */
function isHashed(str) {
    return typeof str === 'string' && /^\$2[aby]\$\d{2}\$/.test(str);
}

module.exports = { hashPassword, comparePassword, isHashed };