const PropertyController = require('./property.controller');
const PropertyModule = require('./property.model');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation'); 


exports.propertyRoutes = function (app) {
    app.post('/property', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PropertyModule.uploadPropertyImage,
        PropertyController.insert
    ]);
    app.put('/property/:propertyId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PropertyModule.uploadPropertyImage,
        PropertyController.editProperty,
        PropertyController.updatePropertyImages
    ]);
    app.get('/property/:propertyId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PropertyController.getProperty
    ]);
    app.post('/list-property', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PropertyController.findAllProperty
    ]);
    app.get('/property', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PropertyController.getAllProperty
    ]);
    app.delete('/property/:propertyId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PropertyController.deleteProperty
    ]);
    app.get('/set-property-featured/:propertyId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PropertyController.setPropertyFeatured
    ]);
    app.get('/set-property-unfeatured/:propertyId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        PropertyController.setPropertyUnfeatured
    ]);
    app.get('/api/list-all-property', [
        PropertyController.listAllProperty
    ]);
    app.post('/api/search-property', [
        PropertyController.searchProperty
    ]);
    app.get('/api/list-all-property-type', [
        PropertyController.listAllPropertyType
    ]);
    app.get('/api/list-all-property-looking-for', [
        PropertyController.listAllPropertyLookingFor
    ]);
    app.get('/api/list-all-property-purpose', [
        PropertyController.listAllPropertyPurpose
    ]);
    app.get('/api/list-all-property-location', [
        PropertyController.listAllPropertyLocation
    ]);
    app.get('/api/property/:propertyId', [ 
        PropertyController.getProperty
    ]); 
    app.get('/api/featured-property', [ 
        PropertyController.getFeaturedProperty
    ]); 
};