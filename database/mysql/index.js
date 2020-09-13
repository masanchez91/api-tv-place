const mysql = require('promise-mysql');
const moment = require('moment-timezone');
const Promise = require('bluebird');

const { database } = require.main.require('./configurations');
const defaultConfig = database[process.env.NODE_ENV || 'development'];

const checkConfigParameters = configuration => {
	if (!configuration) throw new Error('No configuration; please provide a config for the DB connection');
    if (!configuration.host) throw new Error('No host in config; please provide a host name in the config object');
    if (!configuration.user) throw new Error('No user in config; please provide a user name in the config object');
    if (!configuration.database) throw new Error('No database in config; please provide a database name in the config object');
    if (!configuration.password) throw new Error('No password in config; please provide a password in the config object');
}

checkConfigParameters(defaultConfig);

const pool = mysql.createPool(defaultConfig);

const validateParameters = (query, params) => {
    if (!query || typeof query !== 'string') throw new Error('invalid param: query');
    if (!params || typeof params !== 'object') throw new Error('invalid param: query');
}

const logQuery = (query, params, type) => {
    /* eslint-disable no-console */
    console.log('');
    console.log(`-- ${!type ? '' : type} Query --------------------------------------------------`);
    console.log(query); console.log(params);
    console.log('-----------------------------------------------------------');
    console.log('');
    /* eslint-enable no-console */
};

const processIgnoreOption = options => (options.ignoreInsert ? 'IGNORE' : '');

const getOnDuplicateValues = columnNames => (
    columnNames.reduce((accumulator, current) => accumulator + `${current} = VALUES(${current}), `, '')
);

const getUpdateConditionStatement = conditions => (
    Object.keys(conditions).reduce((accumulator, current) => accumulator + `${current} = ${mysql.escape(conditions[current])} AND `, '').slice(0, -4)
);

const getOnDuplicateStatement = columnNames => (
    `ON DUPLICATE KEY UPDATE ${getOnDuplicateValues(columnNames)}`.slice(0, -2)
);

const getSingleOnDuplicateStatement = obectToInsert => {
    const columnNames = Object.keys(obectToInsert);
    return getOnDuplicateStatement(columnNames);
};

const getColumnList = columnNames => (
    columnNames.reduce((accumulator, currentValue) => accumulator + currentValue + ' , ', ' ').slice(0, -2)
);

const getObjectValues = object => Object.keys(object).map(key => object[key]);

const getGateway = (config = defaultConfig) => {
    const shouldLog = options => (options.showQuery || config.showQueries);

    const doQuery = (query, parameters, options) => {
        validateParameters(query, parameters);
        return pool.getConnection()
            .then(connection => {
                if (shouldLog(options)) logQuery(query, parameters, options.queryType); // eslint-disable-line no-console
                const queryResult = connection.query(query, parameters);
                pool.releaseConnection(connection);
                return queryResult;
            });
    };

    const doSingleInsert = (tableName, objectToInsert, options) => {
        const normalizedObjectToInsert = Array.isArray(objectToInsert) ? objectToInsert[0] : objectToInsert;
        options.queryType = 'Single Insert';
        const ignore = processIgnoreOption(options);
        const onDuplicateStatement = options.upsert ? getSingleOnDuplicateStatement(normalizedObjectToInsert) : '';
        const insertQuery = `INSERT ${ignore} INTO ${tableName} SET ? ${onDuplicateStatement} ;`;
        return doQuery(insertQuery, normalizedObjectToInsert, options);
    };

    const doBulkInsert = (tableName, objectsToInsert, options) => {
        options.queryType = 'Bulk Insert';
        const ignore = processIgnoreOption(options);
        const columnNames = Object.keys(objectsToInsert[0]);
        const values = [objectsToInsert.map(getObjectValues)];
        const onDuplicateStatement = options.upsert ? getOnDuplicateStatement(columnNames) : '';
        const insertQuery = `INSERT ${ignore} INTO ${tableName}(${columnNames}) VALUES ? ${onDuplicateStatement} ;`;
        return doQuery(insertQuery, values, options);
    };

    const doUpdate = (tableName, dataToUpdate, conditions, options) => {
        options.queryType = 'Update';
        const conditionStatement = getUpdateConditionStatement(conditions);
        const whereStatement = conditionStatement !== '' ? `WHERE ${conditionStatement}` : '';
        const updateQuery = `UPDATE ${tableName} SET ? ${whereStatement};`;
        return doQuery(updateQuery, dataToUpdate, options);
    };

    return {
        query: (query = 'SELECT 1;', params = [], options = { showQuery: false }) => doQuery(query, params, options),

        select: (tableName = '', columnNames = ['*'], conditions = {}, options = { showQuery: false }) => {
            options.queryType = 'SELECT';
            const columnsList = getColumnList(columnNames);
            const conditionStatement = getUpdateConditionStatement(conditions);
            const whereStatement = conditionStatement !== '' ? `WHERE ${conditionStatement}` : '';
            const query = `SELECT ${columnsList} FROM ${tableName} ${whereStatement};`;
            return doQuery(query, [], options);
        },

        insert: (tableName = '', objectToInsert = {}, options = { showQuery: false, ignoreInsert: false }) => {
            const alteredOptions = { ...options, upsert: false };
            if (Array.isArray(objectToInsert) && objectToInsert.length > 1) return doBulkInsert(tableName, objectToInsert, alteredOptions);
            return doSingleInsert(tableName, objectToInsert, alteredOptions);
        },

        insertIfNotExist: (tableName = '', objectToInsert = {}, conditions = {}, options = { showQuery: false }) => {
            const conditionStatement = getUpdateConditionStatement(conditions);
            const whereStatement = conditionStatement !== '' ? `WHERE ${conditionStatement}` : '';
            const lookUpQuery = `SELECT * FROM ${tableName} ${whereStatement}`;
            return doQuery(lookUpQuery, [], options).then(result => {
                if (result.length > 0) return result;
                return doSingleInsert(tableName, objectToInsert, options);
            });
        },

        upsert: (tableName = '', objectToInsert = {}, options = { showQuery: false }) => {
            const alteredOptions = { ...options, upsert: true };
            if (Array.isArray(objectToInsert) && objectToInsert.length > 1) return doBulkInsert(tableName, objectToInsert, alteredOptions);
            return doSingleInsert(tableName, objectToInsert, alteredOptions);
        },

        ifExists: (query = 'SELECT 1;', params = [], options = { showQuery: false }) => (
            doQuery(query, params, options).then(result => result.length > 0)
        ),

        ifExistWithDetails: (query = 'SELECT 1;', params = [], options = { showQuery: false }) => (
            doQuery(query, params, options).then(result => {
                if (result.length > 0) return result;
                return false;
            })
        ),

        update: (tableName = '', dataToUpdate = {}, conditions = {}, options = { showQuery: false }) => (
            doUpdate(tableName, dataToUpdate, conditions, options)
        ),

        now: (date = '', timezone = '', format = '') => {
            if (format === '') format = 'YYYY-MM-DD HH:mm:ss';
            if (timezone === '') timezone = 'America/Mexico_City';
            if (date === '') return moment().tz(timezone).format(format);
            return moment.tz(date, format, true, timezone).format(format);
        },

        nowUTC: () => moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS'),

        timestamp: (timezone = '') => {
            const format = 'X';
            if (timezone === '') return new Date(moment().format(format));
            return new Date(moment().tz(timezone).format(format));
        },

        getPoolConnection: () => pool.getConnection(),

        delete: (tableName = '', conditions = {}, options = { showQuery: false }) => {
            options.queryType = 'Delete';
            const conditionStatement = getUpdateConditionStatement(conditions);
            const whereStatement = conditionStatement !== '' ? `WHERE ${conditionStatement}` : '';
            return doQuery(`DELETE FROM ${tableName} ${whereStatement} ;`, [], options);
        },

        callStoredProcedure: (storedProcedure = '', params = [], options = { showQuery: false }) => {
            options.queryType = 'Call Stored Procedure';
            return doQuery(`CALL ${storedProcedure}(?);`, params, options);
        },

        doTransaction: (queries = [{ query: 'SELECT 1;', params: [] }]) => (
            pool.getConnection().then(connection => (
                connection.beginTransaction()
                    .then(() => Promise.mapSeries(queries, query => connection.query(query.query, query.params)))
                    .then(result => {
                        connection.commit();
                        return result;
                    })
                    .catch(error => {
                        connection.rollback();
                        pool.releaseConnection(connection);
                        throw error;
                    })
                    .then(result => {
                        pool.releaseConnection(connection);
                        return result;
                    })
            ))
        ),

    };
};

module.exports = getGateway;
