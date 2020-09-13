const mysql = require('../../mysql')();
const model = {};

model.getUserByEmail = email => mysql.query(`
	SELECT ID_CAT_MANAGER, name, lastName, email, password, phone, status
	FROM CatManager
	WHERE email = (?);`, [email]
);

module.exports = model;
