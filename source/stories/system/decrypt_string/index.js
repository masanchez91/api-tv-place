const Crypto = require('cryptr');

const { keys } = require.main.require('./configurations');
const oCrypt = new Crypto(keys.cryptr);

const decryptString = (encrypted) => oCrypt.decrypt(encrypted);

module.exports = { decryptString };
