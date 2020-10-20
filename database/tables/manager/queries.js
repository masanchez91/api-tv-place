const mysql = require('../../mysql')();
const model = {};

model.get = parameters => {
    let valueParameters = Object.values(parameters);
    let whereThConditions = '';
    let counter = 1;

    for (let propertyName in parameters) {

        if (counter === valueParameters.length) {
            whereThConditions += `${ propertyName } = ? `;
        } else {
            whereThConditions += `${ propertyName } = ? AND `;
        }

        counter += 1;
    }

    const query = `SELECT ID_CAT_MANAGER, name, lastName, email, password, phone, status, creationUser,
        modificationUser, dischargeUser, creationDate, modificationDate, dischargeDate
        FROM CatManager WHERE ${ whereThConditions };`;

    return mysql.query(query, valueParameters);
}

model.getUserByEmail = email => mysql.query(`
	SELECT ID_CAT_MANAGER, name, lastName, password AS comparePassword, phone, status
	FROM CatManager
	WHERE email = (?);`, [email]
);

module.exports = model;
