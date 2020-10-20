const functions = require('./functions');
const validation = require('./validation');
const system = require('../../system');

const create = parameters => system.startPromiseChain(parameters)
	.then(validation.validateParameters)
	.then(functions.verifySecurity)
	.then(functions.verifyEmail)
	.then(functions.checkIfUserExists)
	.then(functions.generatePassword)
	.then(functions.encryptPassword)
	.then(functions.saveUser)
	.then(functions.notifyUser);

module.exports = { create };
