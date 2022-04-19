const SettingsController = require('./settings.controller');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation'); 


exports.settingsRoutes = function (app) {
    app.post('/api/contact', [
        SettingsController.contactUs
    ]);
    app.get('/dashboard-data', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        SettingsController.getDashboardData
    ]);
};