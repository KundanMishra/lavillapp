const OfferController = require('./offer.controller'); 
const OfferModel = require('./offer.model');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation'); 


exports.offerRoutes = function (app) {
    app.post('/offer', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        OfferController.insert
    ]);
    app.put('/offer/:offerId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        OfferController.editOffer
    ]);
    app.get('/offer/:offerId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        OfferController.getOffer
    ]);
    app.post('/list-offer', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        OfferController.findAllOffer
    ]);
    app.get('/offer', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        OfferController.getAllOffer
    ]);
    app.delete('/offer/:offerId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        OfferController.deleteOffer
    ]);
    app.get('/api/list-all-offer', [
        OfferController.listAllOffer
    ]);
    app.get('/api/offer/:offerId', [
        OfferController.getOffer
    ]);
};