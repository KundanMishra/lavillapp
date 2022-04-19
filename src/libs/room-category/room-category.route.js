const RoomCategoryController = require('./room-category.controller');
const RoomCategoryModel = require('./room-category.model');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation'); 


exports.roomCategoryRoutes = function (app) {
    app.post('/room-category', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomCategoryController.insert
    ]);
    app.put('/room-category/:roomCategoryId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomCategoryController.editRoomCategory
    ]);
    app.get('/room-category/:roomCategoryId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomCategoryController.getRoomCategory
    ]);
    app.post('/list-room-category', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomCategoryController.findAllRoomCategory
    ]);
    app.get('/room-category', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomCategoryController.getAllRoomCategory
    ]);
    app.delete('/room-category/:roomCategoryId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomCategoryController.checkRoomCategoryDelete,
        RoomCategoryController.deleteRoomCategory
    ]);
    app.get('/api/list-all-room-category', [
        RoomCategoryController.listAllRoomCategory
    ]);
    app.get('/api/list-all-room-category/:branch', [
        RoomCategoryController.listAllRoomCategoryByBranch
    ]);
};