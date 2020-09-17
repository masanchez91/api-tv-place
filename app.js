require('dotenv').config();
const env = process.env.NODE_ENV || 'development';
const Router = require('koa-better-router');
const helmet = require('koa-helmet');
const koaBody = require('koa-body');
const koaJwt = require('koa-jwt');
const cors = require('kcors');
const Koa = require('koa');
const { system } = require('./source');
const { keys, messages } = require('./configurations');
const routes = require('./routes');
const app = new Koa();
const router = Router().loadMethods();

const publicRoutes = [
    /^\/managers\/login/,
    /^\/managers\/recover-password/,
];

const formatError = (error) => {
    if (error.status === 401) system.throwError(error.status, messages.loginError);
    if (error.sqlMessage) system.throwError(500, messages.genericError, 'database error');
    if (error.errno) system.throwError(500, messages.genericError, 'conection error');
    return error;
};

const errorHandler = (ctx, next) => (
    next().catch((error) => {
        ctx.status = error.status || error.statusCode || 500;
        ctx.body = formatError(error);
    })
);

const jwt = koaJwt({ secret: keys.jwt }).unless({ path: publicRoutes });
app.use(cors());
app.use(koaBody());
app.use(helmet());
app.use(errorHandler);
app.use(jwt);
app.use(router.middleware());

router.extend(routes);
const port = process.env.PORT || 8080;
app.listen(port);
console.log('Ready @ http://localhost:', port, '@', env, 'env'); // eslint-disable-line no-console
