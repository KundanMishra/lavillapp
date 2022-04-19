const EventController = require('./event.controller'); 
const EventModel = require('./event.model');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation'); 


exports.eventRoutes = function (app) {
    app.post('/event', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        EventModel.uploadEventImage,
        EventController.insert
    ]);
    app.put('/event/:eventId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        EventModel.uploadEventImage,
        EventController.editEvent
    ]);
    app.get('/event/:eventId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        EventController.getEvent
    ]);
    app.get('/set-event-featured/:eventId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        EventController.setEventFeatured
    ]);
    app.get('/set-event-unfeatured/:eventId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        EventController.setEventUnfeatured
    ]);
    app.post('/list-event', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        EventController.findAllEvent
    ]);
    app.get('/event', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        EventController.getAllEvent
    ]);
    app.delete('/event/:eventId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        EventController.deleteEvent
    ]);
    app.get('/api/list-all-event', [
        EventController.listAllEvent
    ]);
    app.get('/api/list-featured-event', [
        EventController.listFeaturedEvent
    ]);
    app.get('/api/event/:eventId', [
        EventController.getEvent
    ]);
};