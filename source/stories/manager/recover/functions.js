const jwt = require('jsonwebtoken');
const { messages, keys } = require.main.require('./configurations');
const { manager, mysql } = require.main.require('./database');
const system = require('../../system');
const functions = {};

async function getUser(email) {
    const user = await manager.getUserByEmail(email);

    if (user.length > 0) return { ...user[0] };
    return system.throwError(400, messages.userNotExists, { email });
}

functions.getUserAccount = async user => {
    const { email } = user;
    const userInformation = await getUser(email);

    return { ...userInformation, ...user };
}

functions.verifyUser = async user => {
    const { status, email } = user;

    if (status === 1) return user;
    return system.throwError(400, messages.noPermission, { email });
}

async function normalizeRecoveryParameters(user) {
    return {
        id: user.ID_CAT_MANAGER,
        completeName: user.name + ' ' + user.lastName,
        email: user.email,
        creationDate: mysql.now(),
    };
}

functions.createToken = async user => {
    const setRecoveryParameters = await normalizeRecoveryParameters(user);

    return {
        token: jwt.sign(setRecoveryParameters, keys.jwt, { expiresIn: '1d' }),
        user: setRecoveryParameters,
    };
}

async function normalizeEmail(parameters) {
    const { token, user } = parameters;
    return {
        to: user.email,
        subject: 'Recuperación de la cuenta.',
        title: 'Tu solicitud ha sido exitosa.',
        text: `${ user.completeName } Ingresa a la siguiente liga para generar una contraseña nueva 
            <a href="http://localhost:8080/admin/recover?token=${ token }"> Generar contraseña </a>`,
    };
}

functions.notifyUser = async parameters => {
    const setEmailParameters = await normalizeEmail(parameters);
    await system.sendEmail(setEmailParameters);

    return { status: 200, message: messages.successfulRecovery };
}

module.exports = functions;
