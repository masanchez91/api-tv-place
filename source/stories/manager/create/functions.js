const { manager, mysql } = require.main.require('./database');
const { messages } = require.main.require('./configurations');
const system = require('../../system');
const minimumPasswordLength = 6;
const defaultUserStatus = 1;
const functions = {};

async function validateEmail(email) {
	const regex= /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return regex.test(email);
}

functions.verifyEmail = async user => (
	validateEmail(user.email) ? user : system.throwError(400, messages.validationError)
);

async function userExists(email) {
	const user = await manager.getUserByEmail(email);

	if (user.length > 0) return false;
	return true;
}

functions.checkIfUserExists = async user => (
	await userExists(user.email) ? user : system.throwError(400, messages.userExists)
);

async function setRandomPassword(passwordLength) {
	const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
	var passsword = "";

	for (i = 0; i < passwordLength; i++) {
		passsword +=characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return passsword;
}

functions.generatePassword = async user => {
	const unencryptedPassword = await setRandomPassword(minimumPasswordLength);
	return { ...user, unencryptedPassword };
}

functions.encryptPassword = async user => {
	const password = await system.encryptPassword(user.unencryptedPassword);
	return { ...user, password} ;
}

async function normalizeUser(user) {
	delete user.unencryptedPassword;

	const normalized = {
		...user,
		status: defaultUserStatus,
		creationDate: mysql.now(),
	}

	return normalized;
}

async function createUser(user) {
	const registeredUser = await manager.insert(user);
	return registeredUser.insertId;
}

functions.saveUser = async user => {
	const { unencryptedPassword } = user;

	const setUserParameters = await normalizeUser(user);
	const userId = await createUser(setUserParameters);

	return { ...user, unencryptedPassword, userId };
}

async function normalizeEmail(parameters) {
	const normalized = {
		to: parameters.email,
		subject: 'Tu registro ha sido exitoso.',
		title: '¡Ya cuentas con una cuenta de TV PLACE!',
		text: `Podrás  utilizar tu correo: ${ parameters.email } y contraseña: ${ parameters.unencryptedPassword } para ingresar a tu cuenta. `,
	};

	return normalized;
}

functions.notifyUser = async user => {
	const setEmailParameters = await normalizeEmail(user);
	await system.sendEmail(setEmailParameters);

	return { status: 200, message: messages.successfulRegistration };
}

module.exports = functions;
