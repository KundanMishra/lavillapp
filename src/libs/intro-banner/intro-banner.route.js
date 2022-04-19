const config = require('../../configs/env');
const IntroBannerController = require('./intro-banner.controller');
const IntroBannerModel = require('./intro-banner.model');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation');

const SUPER_ADMIN = config.permissionLevels.SUPER_ADMIN;
const FREE = config.permissionLevels.NORMAL_USER;

exports.introBannerRoutes = function (app) {
    app.post('/intro-banner', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        IntroBannerModel.uploadIntroBanner,
        IntroBannerController.insert
    ]);
    app.get('/intro-banner/:introBannerId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        IntroBannerController.findIntroBannerById
    ]);
    app.put('/intro-banner/:introBannerId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        IntroBannerModel.uploadIntroBanner,
        IntroBannerController.updateIntroBannerById
    ]);
    app.delete('/intro-banner/:introBannerId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        IntroBannerController.deleteIntroBannerById
    ]);
    app.post('/get-intro-banner', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        IntroBannerController.findAllIntroBanner
    ]); 
    app.get('/api/intro-banner', [
        IntroBannerController.getIntroBannerWithStatus
    ]);
};