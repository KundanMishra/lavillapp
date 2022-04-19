const VerifyUserMiddleware = require('./verify.user.middleware');
const AuthorizationController = require('./authorization.controller');
const AuthValidationMiddleware = require('../middleware/auth.validation');
exports.authorizationRoutes = function (app) {

    app.post('/auth', [
        VerifyUserMiddleware.hasAuthValidFields,
        VerifyUserMiddleware.isPasswordAndUserMatch,
        AuthorizationController.login
    ]);

    app.post('/auth/refresh', [
        AuthValidationMiddleware.validJWTNeeded,
        AuthValidationMiddleware.verifyRefreshBodyField,
        AuthValidationMiddleware.validRefreshNeeded,
        AuthorizationController.login
    ]);
    app.post('/admin/auth', [
        VerifyUserMiddleware.adminHasAuthValidFields,
        VerifyUserMiddleware.adminIsPasswordAndUserMatch,
        AuthorizationController.login
    ]);

    app.post('/admin/auth/refresh', [
        AuthValidationMiddleware.validJWTNeeded,
        AuthValidationMiddleware.verifyRefreshBodyField,
        AuthValidationMiddleware.validRefreshNeeded,
        AuthorizationController.login
    ]);
    app.post('/branch/auth', [
        VerifyUserMiddleware.adminHasAuthValidFields,
        VerifyUserMiddleware.branchIsPasswordAndUserMatch,
        AuthorizationController.login
    ]);

    app.post('/branch/auth/refresh', [
        AuthValidationMiddleware.validJWTNeeded,
        AuthValidationMiddleware.verifyRefreshBodyField,
        AuthValidationMiddleware.validRefreshNeeded,
        AuthorizationController.login
    ]);
};