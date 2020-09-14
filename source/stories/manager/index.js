const login = require('./login');
const create = require('./create');
const recover = require('./recover')

module.exports = {
	...login,
	...create,
	...recover,
}
