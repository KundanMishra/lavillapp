const BookingController = require('./booking.controller');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation'); 
const NORMAL_USER = require('../../configs/env').permissionLevels.NORMAL_USER;

exports.bookingRoutes = function (app) {
    app.post('/api/booking/basic', [
        BookingController.createBookingBasic
    ]);
    app.get('/api/booking/basic/:bookingId', [
        BookingController.getBookingBasic
    ]);
    app.post('/api/booking/user', [
        BookingController.createBookingUser
    ]);
    app.get('/api/booking/:bookingId', [
        BookingController.getBookingUser
    ]);
    app.post('/api/booking/payment', [
        BookingController.createBookingPromoCode,
        BookingController.createBookingLoyalty,
        BookingController.createBookingCard,
        BookingController.updateDateAvailability,
        BookingController.finalBooking
    ]);
    app.get('/api/completed-booking/:bookingId', [
        BookingController.getBooking
    ]);
    app.post('/api/booking/update', [
        BookingController.removeBookingRoomAddonAndOffer,
        BookingController.addBookingRoom,
        BookingController.updateBookingDateAvailability,
        BookingController.updateBookingBasic
    ]);


    
    app.post('/api/booking', [
        BookingController.insert
    ]);
    app.post('/api/booking/auth-check', [
        BookingController.bookingAuthCheck
    ]);
    app.post('/api/booking-by-id-email', [
        BookingController.getBookingByIdEmail
    ]);
    app.put('/booking/:bookingId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.editBooking
    ]);
    app.get('/booking/:bookingId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.getBooking
    ]);
    app.post('/list-booking', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.findAllBooking
    ]);
    app.post('/list-all-booking', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.getAllBooking
    ]);
    app.post('/completed-booking', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.getAllCompletedBooking
    ]);
    app.post('/upcoming-booking', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.getAllUpcomingBooking
    ]);
    app.post('/cancelled-booking', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.getAllCancelledBooking
    ]);
    app.post('/noshow-booking', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.getAllNoShowBooking
    ]);
    app.post('/invalid-booking', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.getAllInvalidBooking
    ]);
    app.delete('/booking/:bookingId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.deleteBooking
    ]);
    app.get('/api/list-all-booking', [
        BookingController.listAllBooking
    ]);
    app.post('/cancel-booking', [
        // ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        BookingController.cancelBooking
    ]);
    app.get('/api/upcoming-booking', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        BookingController.getUpcomingBooking
    ]);
    app.get('/api/completed-booking', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        BookingController.getCompletedBooking
    ]);
    app.get('/api/cancelled-booking', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        BookingController.getCancelledBooking
    ]);
    app.post('/api/cancel-booking', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        BookingController.cancelBookingByUser
    ]);
    app.get('/api/confirm-booking-email/:bookingId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        BookingController.confirmBookingEmail
    ]);
    app.post('/api/update-card', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        BookingController.validateBookingUser,
        BookingController.updateCard
    ]);
    app.post('/check-out', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.checkOut,
        BookingController.checkOutMail
    ]);
    app.post('/move-to-no-show/:bookingId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.moveToNoShow,
        BookingController.moveToNoShowMail
    ]);
    app.get('/mark-as-invalid/:bookingId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BookingController.markAsInvalid
    ]);
};