const LoyaltyController = require('./loyalty.controller');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation'); 
const NORMAL_USER = require('../../configs/env').permissionLevels.NORMAL_USER; 


exports.loyaltyRoutes = function (app) {
    app.post('/loyalty', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        LoyaltyController.insert
    ]);
    app.get('/loyalty/:loyaltyId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        LoyaltyController.getLoyalty
    ]);
    app.get('/last-loyalty', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        LoyaltyController.getLastLoyalty
    ]);
    app.post('/list-loyalty', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        LoyaltyController.findAllLoyalty
    ]);
    app.get('/loyalty', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        LoyaltyController.getAllLoyalty
    ]);
    app.get('/api/get-loyalty-detail', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        LoyaltyController.getLastLoyalty
    ]);
};