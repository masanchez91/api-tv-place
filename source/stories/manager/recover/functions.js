const jwt = require('jsonwebtoken');
const { messages, keys } = require.main.require('./configurations');
const { manager, mysql } = require.main.require('./database');
const system = require('../../system');
const functions = {};

async function getUser(email = '') {
    const user = await manager.getUserByEmail(email);

    if (user.length > 0) return { ...user[0] };
    return system.throwError(400, messages.userNotExists, { email });
}

functions.getUserAccount = async user => {
    const { email } = user.token || user;
    const userInformation = await getUser(email);

    return { ...userInformation, ...user };
}

functions.verifyUser = async user => {
    const { status, email } = user;

    if (status === 1) return user;
    return system.throwError(403, messages.noPermission, { email });
}

async function normalizeRecoveryParameters(user = {}) {
    return {
        id: user.ID_CAT_MANAGER,
        email: user.email,
        creationDate: mysql.now(),
    };
}

functions.createToken = async user => {
    const setRecoveryParameters = await normalizeRecoveryParameters(user);

    return {
        token: jwt.sign(setRecoveryParameters, keys.jwt, { expiresIn: '1d' }),
        user,
    };
}

async function normalizeEmail(parameters = {}) {
    const { token, user } = parameters;

    return {
        to: user.email,
        subject: 'Recuperación de la cuenta.',
        title: 'Tu solicitud ha sido exitosa.',
        text: `${ user.name + ' ' + user.lastName } Ingresa a la siguiente liga para generar una contraseña nueva 
            <a href="http://localhost:8080/admin/recover?token=${ token }"> Generar contraseña </a>`,
    };
}

functions.notifyUser = async parameters => {
    const setEmailParameters = await normalizeEmail(parameters);
    await system.sendEmail(setEmailParameters);

    return { status: 200, message: messages.successfulRecovery };
}

functions.verifyTokenSecurity = async parameters => {
    const { ID_CAT_MANAGER, id, token } = parameters;
    const { exp } = token;

    const validity = new Date() < new Date(exp * 1000);
    const verifiedUser = ID_CAT_MANAGER === id;

    if (validity && verifiedUser) return parameters;
    return system.throwError(400, messages.invalidToken);
}

functions.verifyPassword = async parameters => {
    const { newPassword, confirmPassword } = parameters;

    if (newPassword === confirmPassword) return parameters;
    return system.throwError(400, messages.passwordsDoNotMatch);
}

functions.encryptPassword = async user => {
    const { ID_CAT_MANAGER, newPassword } = user;
    const password = await system.encryptPassword(newPassword);

    return { ID_CAT_MANAGER, password };
}

functions.updatePassword = async  user => {
    const userUpdated = await manager.update(user);

    if (userUpdated[0].affectedRows === 1) {
        return { status: 200, message: messages.passwordRecovered };
    }

    return system.throwError(403, messages.updateError);
}

module.exports = functions;
