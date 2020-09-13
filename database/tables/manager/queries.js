const mysql = require('../../mysql')();
const model = {};

model.getUserByEmail = email => mysql.query(`
	SELECT ID_CAT_MANAGER, name, lastName, password AS comparePassword, phone, status
	FROM CatManager
	WHERE email = (?);`, [email]
);

module.exports = model;
