const functions = require('./functions');
const validation = require('./validation');
const system = require('../../system');

const recoverAccount = parameters => system.startPromiseChain(parameters)
    .then(validation.validateParametersRecoverAccount)
    .then(functions.getUserAccount)
    .then(functions.verifyUser)
    .then(functions.createToken)
    .then(functions.notifyUser);

const recoverPassword = parameters => system.startPromiseChain(parameters)
    .then(validation.validateParametersRecoverPassword)
    .then(functions.getUserAccount)
    .then(functions.verifyUser)
    .then(functions.verifyPassword)
    .then(functions.encryptPassword)
    .then(functions.updatePassword);

module.exports = { recoverAccount, recoverPassword };
