const crypt = require('bcryptjs');
const Promise = require('bluebird');

const encryptPassword = (text) => (
    new Promise((resolve, reject) => {
        const cycles = 10;
        crypt.genSalt(cycles, (saltError, salt) => {
            if (saltError) reject(saltError);
            crypt.hash(text, salt, (hashError, hash) => {
                if (hashError) reject(hashError);
                else resolve(hash);
            });
        });
    })
);

module.exports = { encryptPassword };
