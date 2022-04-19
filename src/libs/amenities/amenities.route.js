const AmenitiesController = require('./amenities.controller');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation'); 


exports.amenitiesRoutes = function (app) {
    app.post('/amenities', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.insert
    ]);
    app.put('/amenities/:amenitiesId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.editAmenities
    ]);
    app.get('/amenities/:amenitiesId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.getAmenities
    ]);
    app.get('/amenities', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.findAllAmenities
    ]);
    app.get('/room-amenities', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.findAllRoomAmenities
    ]);
    app.get('/property-amenities', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.findAllPropertyAmenities
    ]);
    app.post('/list-amenities', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.listAllAmenities
    ]);
    app.get('/amenities-type', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.findAllAmenitiesType
    ]);
    app.get('/amenities-icon', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.findAllAmenitiesIcon
    ]);
    app.delete('/amenities/:amenitiesId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.deleteAmenities
    ]);
    app.get('/set-amenities-featured/:amenitiesId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.setAmenitiesFeatured
    ]);
    app.get('/set-amenities-unfeatured/:amenitiesId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        AmenitiesController.setAmenitiesUnfeatured
    ]);

    app.get('/api/list-featured-amenities', [
        AmenitiesController.listFeaturedAmenities
    ]);
};