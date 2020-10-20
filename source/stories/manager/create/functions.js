const { manager, mysql } = require.main.require('./database');
const { messages } = require.main.require('./configurations');
const system = require('../../system');
const minimumPasswordLength = 6;
const defaultUserStatus = 1;
const functions = {};

async function getUser(parameters = {}) {
	const user = await manager.get(parameters);
	return user.length === 0;
}

functions.verifySecurity = async user => {
	const ACTIVE = 1;
	const { token } = user;
	const { ID_CAT_MANAGER } = token;
	const verifiedUser = await getUser({ ID_CAT_MANAGER, status: ACTIVE });
	if (!verifiedUser) return user
	system.throwError(403, messages.noPermission)
}

async function validateEmail(email = '') {
	const regex= /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return regex.test(email);
}

functions.verifyEmail = async user => (
	await validateEmail(user.email) ? user : system.throwError(400, messages.validationError)
);

functions.checkIfUserExists = async user => (
	await getUser({ email: user.email}) ? user : system.throwError(400, messages.userExists)
);

async function setRandomPassword(passwordLength = minimumPasswordLength) {
	const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
	let passsword = '';

	for (let i = 0; i < passwordLength; i++) {
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

async function normalizeUser(user = {}) {
	const { token } = user;
	delete user.unencryptedPassword;
	delete user.token;

	return {
		...user,
		creationUser: token.ID_CAT_MANAGER,
		status: defaultUserStatus,
		creationDate: mysql.now(),
	};
}

async function createUser(user = {}) {
	const registeredUser = await manager.insert(user);
	return registeredUser.insertId;
}

functions.saveUser = async user => {
	const { unencryptedPassword } = user;
	const setUserParameters = await normalizeUser(user);
	const userId = await createUser(setUserParameters);

	return { ...user, unencryptedPassword, userId };
}

async function normalizeEmail(parameters = {}) {
	return {
		to: parameters.email,
		subject: 'Tu registro ha sido exitoso.',
		title: '¡Ya cuentas con una cuenta de TV PLACE!',
		text: `Podrás  utilizar tu correo: ${parameters.email} y contraseña: ${parameters.unencryptedPassword} para ingresar a tu cuenta. `,
	};
}

functions.notifyUser = async user => {
	const setEmailParameters = await normalizeEmail(user);
	await system.sendEmail(setEmailParameters);

	return { status: 201, message: messages.successfulRegistration };
}

module.exports = functions;
