const tables = require('./tables');
const mysql = require('./mysql')();

module.exports = {
	...tables,
	mysql,
};
