const mysql = require('../../mysql')();
const model = {};
const tableName = 'CatManager';

model.insert = parameters => mysql.insert(tableName, parameters);

model.update = ({
	ID_CAT_MANAGER,
	name,
	lastName,
	email,
	password,
	phone,
	status,
	creationUser,
	modificationUser,
	dischargeUser,
	creationDate,
	modificationDate,
	dischargeDate,
}) => {
	const promises = [];

	if (name || name === 0) { promises.push(mysql.update(tableName, { name }, { ID_CAT_MANAGER })); }
	if (lastName || lastName === 0) { promises.push(mysql.update(tableName, { lastName }, { ID_CAT_MANAGER })); }
	if (email || email === 0) { promises.push(mysql.update(tableName, { email }, { ID_CAT_MANAGER })); }
	if (password || password === 0) { promises.push(mysql.update(tableName, { password }, { ID_CAT_MANAGER })); }
	if (phone || phone === 0) { promises.push(mysql.update(tableName, { phone }, { ID_CAT_MANAGER })); }
	if (status || status === 0) { promises.push(mysql.update(tableName, { status }, { ID_CAT_MANAGER })); }
	if (creationUser || creationUser === 0) { promises.push(mysql.update(tableName, { creationUser }, { ID_CAT_MANAGER })); }
	if (modificationUser || modificationUser === 0) { promises.push(mysql.update(tableName, { modificationUser }, { ID_CAT_MANAGER })); }
	if (dischargeUser || dischargeUser === 0) { promises.push(mysql.update(tableName, { dischargeUser }, { ID_CAT_MANAGER })); }
	if (creationDate || creationDate === 0) { promises.push(mysql.update(tableName, { creationDate }, { ID_CAT_MANAGER })); }
	if (modificationDate || modificationDate === 0) { promises.push(mysql.update(tableName, { modificationDate }, { ID_CAT_MANAGER })); }
	if (dischargeDate || dischargeDate === 0) { promises.push(mysql.update(tableName, { dischargeDate }, { ID_CAT_MANAGER })); }

	return Promise.all(promises).then(result => result);
}

module.exports = model;
