const PromoCodeController = require('./promo-code.controller');
const PromoCodeModel = require('./promo-code.model');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation'); 
const NORMAL_USER = require('../../configs/env').permissionLevels.NORMAL_USER;


exports.promoCodeRoutes = function (app) {
    app.post('/promo-code', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PromoCodeController.insert,
        PromoCodeController.promoCodeMail
    ]);
    app.put('/promo-code/:promoCodeId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction, 
        PromoCodeController.editPromoCode
    ]);
    app.get('/promo-code/:promoCodeId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PromoCodeController.getPromoCode
    ]);
    app.get('/promo-code', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PromoCodeController.findAllPromoCode
    ]);
    app.delete('/promo-code/:promoCodeId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PromoCodeController.deletePromoCode
    ]); 
    app.post('/list-promo-code', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PromoCodeController.listAllPromoCode
    ]);
    app.post('/api/check-promo-code', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        PromoCodeController.checkPromoCodeByUser
    ]);
    app.get('/api/list-promo-code/:branchId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        PromoCodeController.listAllAvailablePromoCode
    ]);
};