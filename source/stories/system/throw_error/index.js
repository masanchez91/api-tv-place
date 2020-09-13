const { messages } = require.main.require('./configurations');

const throwError = (status, message, data) => {
    const error = new Error();
    error.status = status || 400;
    error.message = (message || messages.genericError).toString().replace(/"/g, '');
    error.data = data;
    throw (error);
};

module.exports = { throwError };
