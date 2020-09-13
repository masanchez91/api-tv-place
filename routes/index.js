const router = require('koa-better-router')();

const manager = require('./modules/manager');
router.extend(manager);

module.exports = router;
