const RoomController = require('./room.controller');
const RoomModule = require('./room.model');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation');


exports.roomRoutes = function (app) {
    app.post('/room', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomModule.uploadRoomImage,
        RoomController.insert
    ]);
    app.put('/room/:roomId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomModule.uploadRoomImage,
        RoomController.editRoom,
        RoomController.updateRoomImages
    ]);
    app.get('/room/:roomId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.getRoom
    ]);
    app.get('/room', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.findAllRoom
    ]);
    app.post('/list-room', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.listAllRoom
    ]);
    app.get('/room-bed-type', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.findAllRoomBedType
    ]);
    app.delete('/room/:roomId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.deleteRoom
    ]);
    app.post('/update-room-addon', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomModule.uploadRoomAddonImage,
        RoomController.insertAddon
    ]);
    app.post('/create-room-addon', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.insertChoosingAddon
    ]);
    app.get('/room-addon/:roomId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.findAllRoomAddon
    ]);
    app.delete('/room-addon/:addonId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.deleteRoomAddon
    ]);
    app.get('/set-room-featured/:roomId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.setRoomFeatured
    ]);
    app.get('/set-room-unfeatured/:roomId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.setRoomUnfeatured
    ]);
    app.post('/update-room-date', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.updateRoomDate
    ]);
    app.post('/api/search-room-validate', [
        RoomController.getRoomIds,
        RoomController.getRoomIdsReturn
    ]);
    app.post('/api/search-room', [
        RoomController.getRoomIds,
        RoomController.searchRoom
    ]);
    app.post('/api/search-room-availability', [
        RoomController.searchRoomAvailability
    ]);
    app.post('/api/edit/search-room-availability', [
        RoomController.searchEditRoomAvailability
    ]);
    app.post('/api/check-availability', [
        RoomController.checkAvailability
    ]);
    app.get('/api/list-bed-types', [
        RoomController.listBedTypes
    ]);
    app.get('/api/list-countries', [
        RoomController.listCountries
    ]);
    app.get('/api/list-featured-rooms', [
        RoomController.listFeaturedRooms
    ]);
    app.post('/get-room-availabilities/:branchId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.findAllRoomAvailabilitiesByBranch
    ]);
    app.post('/update-room-pricing-value', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.updateRoomPricingValue,
        RoomController.createRoomPricingValue
    ]);
    // app.post('/room-pricing-bulk-update', [
    //     ValidationMiddleware.validJWTNeeded,
    //     PermissionMiddleware.onlySuperAdminCanDoThisAction,
    //     RoomController.roomPricingBulkUpdate
    // ]);
    app.post('/update-room-pricing/:roomDateId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.updateRoomPricing
    ]);
    app.post('/room-availabilities/:roomId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.findAllRoomAvailabilitiesByRoom
    ]);
    app.get('/get-other-rooms/:roomId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.getOtherRooms
    ]);
    app.post('/update-related-rooms/:roomId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.updateRelatedRooms
    ]);
    app.get('/get-related-rooms/:roomId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.getRelatedRooms
    ]);
    app.get('/get-unique-addons', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.getUniqueAddons
    ]);
    app.get('/api/list-offered-rooms', [
        RoomController.listOfferedRooms
    ]);
    app.post('/update-room-count/:roomId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.updateRoomCount
    ]);

    app.post('/update-room-count-date/', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        RoomController.updateRoomCountWithDate
    ]);
};