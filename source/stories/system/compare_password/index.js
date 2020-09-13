const crypt = require('bcryptjs');
const Promise = require('bluebird');

const comparePassword = (text, hash) => (
    new Promise((resolve, reject) => {
        crypt.compare(text, hash, (error, isEqual) => {
            if (error) reject(error);
            else resolve(isEqual);
        });
    })
);

module.exports = { comparePassword };
