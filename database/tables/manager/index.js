const insert_update = require('./insert_update');
const queries = require('./queries');

module.exports = {
	...insert_update,
	...queries,
};
