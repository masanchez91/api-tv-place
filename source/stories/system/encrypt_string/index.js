const Crypto = require('cryptr');

const { keys } = require.main.require('./configurations');
const oCrypt = new Crypto(keys.cryptr);

const encryptString = (textToEncrypt) => oCrypt.encrypt(textToEncrypt);

module.exports = { encryptString };
