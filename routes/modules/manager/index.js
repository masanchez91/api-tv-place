const router = require('koa-better-router')().loadMethods();
const { manager } = require.main.require('./source');
const routes = require('./routes');

router.post(routes.create, ctx => manager.create({ ...ctx.request.body })
	.then(data => {
		ctx.body = data;
	})
);

router.post(routes.login, ctx => manager.login({ ...ctx.request.body })
	.then(data => {
		ctx.body = data;
	})
);

router.post(routes.recoverAccount, ctx => manager.recover({ ...ctx.params, ...ctx.request.query })
	.then(data => {
		ctx.body = data;
	})
);

module.exports = router;
