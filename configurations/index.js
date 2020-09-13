const database = require('./settings/database');
const keys = require('./settings/keys');
const messages = require('./settings/messages');

module.exports = {
	...database,
	...keys,
	...messages,
};
