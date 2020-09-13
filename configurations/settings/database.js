module.exports = {
	database: {
		development: {
            host: process.env.BDD_HOST,
            user: process.env.BDD_USER,
            password: process.env.BDD_PASSWORD,
            database: process.env.BDD_DATABASE,
            dateStrings: 'date',
            showQueries: true,
            debug: true,
            connectionLimit: 100,
		},
		sandbox: {
            host: process.env.BDD_HOST,
            user: process.env.BDD_USER,
            password: process.env.BDD_PASSWORD,
            database: process.env.BDD_DATABASE,
            dateStrings: 'date',
            showQueries: false,
            debug: false,
            connectionLimit: 100,
		},
		production: {
            host: process.env.BDD_HOST,
            user: process.env.BDD_USER,
            password: process.env.BDD_PASSWORD,
            database: process.env.BDD_DATABASE,
            dateStrings: 'date',
            showQueries: false,
            debug: false,
            connectionLimit: 100,
		},
	}
};
