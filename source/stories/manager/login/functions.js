const jwt = require('jsonwebtoken');
const { messages, keys } = require.main.require('./configurations');
const { manager } = require.main.require('./database');
const system = require('../../system');
const functions = {};

async function getUser(email = '') {
	const user = await manager.getUserByEmail(email);

	if (user.length > 0) return { ...user[0] };
	return system.throwError(400, messages.loginError, { email });
}

functions.getUserAccount = async user => {
	const { email } = user;
	const userInformation = await getUser(email);

	return { ...userInformation, ...user };
}

functions.verifyUser = async user => {
	const { status, email } = user;
    if (status === 1) return user;
    return system.throwError(403, messages.noPermission, { email });
}

functions.verifyPassword = async user => {
    const { email, password, comparePassword } = user;
    const hasVerified = await system.comparePassword(password, comparePassword);

    if (hasVerified) {
        delete user.password;
        delete user.comparePassword;
        return user;
    }

	return system.throwError(400, messages.loginError, { email });
}

functions.createToken = async user => ({
	token: jwt.sign(user, keys.jwt, { expiresIn: '30d' }),
});

module.exports = functions;
