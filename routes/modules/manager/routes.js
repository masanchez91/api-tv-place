module.exports = {
	create: '/managers/registers',
	login: '/managers/login',
	recoverPassword: '/managers/recover-password/:email',
	resetPassword: '/managers/:id/reset-password',
	update: '/managers/:id',
	delete: '/managers/:id',
	readOne: '/managers/:id',
	readAll: '/managers',
};
