const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Generate a random password (hex format, 16 characters)
const randomPassword = () => {
    return crypto.randomBytes(8).toString('hex');
};

// Hash a password
const hashedPassword = async (password) => {
    return bcrypt.hash(password, 10);
};

// Compare input password with stored hash
const comparePassword = async (inputPassword, storedHash) => {
    const normalizedHash = storedHash.replace(/^\$2y\$/, '$2b$');
    return bcrypt.compare(inputPassword, normalizedHash);
};

module.exports = { randomPassword, hashedPassword, comparePassword };