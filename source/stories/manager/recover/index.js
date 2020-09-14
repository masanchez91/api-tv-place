const functions = require('./functions');
const validation = require('./validation');
const system = require('../../system');

const recover = parameters => system.startPromiseChain(parameters)
    .then(validation.validateParameters)
    .then(functions.getUserAccount)
    .then(functions.verifyUser)
    .then(functions.createToken)
    .then(functions.notifyUser);

module.exports = { recover };
