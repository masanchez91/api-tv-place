const router = require('koa-better-router')().loadMethods();
const { manager } = require.main.require('./source');
const routes = require('./routes');

router.post(routes.create, ctx => manager.create({ token: ctx.state.user, ...ctx.request.body })
	.then(data => {
		ctx.response.status = data.status;
		ctx.body = data;
	})
);

router.post(routes.login, ctx => manager.login({ ...ctx.request.body })
	.then(data => {
		ctx.body = data;
	})
);

router.post(routes.recoverPassword, ctx => manager.recoverPassword({ ...ctx.params, ...ctx.request.query })
	.then(data => {
		ctx.response.status = data.status;
		ctx.body = data;
	})
);

router.put(routes.resetPassword, ctx => manager.resetPassword({ token: ctx.state.user , ...ctx.params, ...ctx.request.body })
	.then(data => {
		ctx.response.status = data.status;
		ctx.body = data;
	})
);

module.exports = router;
