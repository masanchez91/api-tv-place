const router = require('koa-better-router')().loadMethods();
const { manager } = require.main.require('./source');
const routes = require('./routes');

router.post(routes.create, ctx => manager.create({ ...ctx.request.body })
	.then(data => {
		ctx.body = data;
	})
);

module.exports = router;
