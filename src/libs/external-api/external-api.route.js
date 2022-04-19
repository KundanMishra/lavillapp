const ExternalApiController = require('./external-api.controller');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation'); 
const permissionLevels = require('../../configs/env').permissionLevels;


exports.externalApiRoutes = function (app) {
    app.post('/request-payment', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.NORMAL_USER),
        ExternalApiController.requestPayment
    ]);
};