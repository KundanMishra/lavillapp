const UsersController = require('./user.controller');
const UsersModel = require('./user.model');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation');
const config = require('../../configs/env');
const crypto = require('crypto');
const NORMAL_USER = require('../../configs/env').permissionLevels.NORMAL_USER;


exports.userRoutes = function (app) {
    app.post('/user', [
        UsersModel.uploadImage,
        UsersController.validateDuplicate,
        UsersController.insert,
        UsersController.registerMail
    ]);
    app.put('/user/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersModel.uploadImage,
        UsersController.editUser
    ]);
    app.get('/user/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.getUser
    ]);
    app.get('/user', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.findAllUser
    ]);
    app.post('/admin-user', [
        ValidationMiddleware.validJWTNeeded,
        UsersModel.uploadImage,
        UsersController.adminCreate
    ]);
    app.post('/list-admin-user', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        UsersController.findAllAdminUser
    ]);
    app.post('/list-customers', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        UsersController.findAllCustomers
    ]);
    app.get('/block-customer/:id', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        UsersController.blockCustomer
    ]);
    app.get('/enable-customer/:id', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        UsersController.enableCustomer
    ]);
    app.get('/list-normal-user', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        UsersController.findAllNormalUser
    ]);
    app.get('/list-active-admin-user', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        UsersController.findAllActiveAdminUser
    ]);
    app.delete('/user/:userId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.deleteUser
    ]);
    app.get('/api/get-user', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.getUserDetail
    ]);
    app.post('/api/update-user', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.updateUserDetail
    ]);
    app.post('/api/change-image', [
        ValidationMiddleware.validJWTNeeded,
        UsersModel.uploadImage,
        UsersController.updateUserImage
    ]);
    app.post('/api/change-password', [
        ValidationMiddleware.validJWTNeeded,
        function (req, res, next) {
            let errors = [];
            if (req.body) {
                if (!req.body.password) {
                    errors.push('Missing password field');
                }
                if (!req.body.newPassword) {
                    errors.push('Missing New Password field');
                }
                if (!req.body.confirmPassword) {
                    errors.push('Missing Confirm Password field');
                }
                if (req.body.confirmPassword != req.body.newPassword) {
                    errors.push('Mismatch New and Confirm Password field');
                }
                if (errors.length) {
                    return res.status(400).send({ errors: [errors.join(',')] });
                } else {
                    return next();
                }
            } else {
                return res.status(400).send({ errors: 'Missing New Password and password fields' });
            }
        },
        function (req, res, next) {
            UsersModel.findUserById(req.jwt.userId)
                .then((user) => { 
                    if (!user.dataValues) {
                        res.status(404).send({});
                    } else if (user.dataValues.permissionLevel != config.permissionLevels.NORMAL_USER) {
                        res.status(404).send({ errors: ['User Not Found'] });
                    } else if (user.dataValues.status == 0) {
                        res.status(404).send({ errors: ['User is Blocked'] });
                    } else {
                        let passwordFields = user.dataValues.password.split('$');
                        let salt = passwordFields[0];

                        let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                        if (hash === passwordFields[1]) {
                            return next();
                        } else {
                            return res.status(400).send({ errors: ['Old Password Is Not Match'] });
                        }
                    }
                },err=>{
                    return res.status(406).send({ errors:err });
                });
        }, 
        UsersController.updateUserPassword
    ]);
    app.get('/api/get-loyalties', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        UsersController.getLoyalties
    ]);
    app.post('/api/get-otp', [
        UsersController.getOTP
    ]);
    app.post('/api/forget-password', [
        function (req, res, next) {
            let errors = [];
            if (req.body) {
                if (!req.body.password) {
                    errors.push('Missing password field');
                }if (!req.body.email) {
                    errors.push('Missing email field');
                }
                if (!req.body.confirmPassword) {
                    errors.push('Missing Confirm Password field');
                }
                if (req.body.confirmPassword != req.body.password) {
                    errors.push('Mismatch New and Confirm Password field');
                }
                if (errors.length) {
                    return res.status(400).send({ errors: [errors.join(',')] });
                } else {
                    return next();
                }
            } else {
                return res.status(400).send({ errors: 'Missing New Password and password fields' });
            }
        },
        function (req, res, next) {
            UsersModel.findUserByEmail(req.body.email)
                .then((user) => { 
                    if (!user.dataValues) {
                        res.status(404).send({});
                    } else if (user.dataValues.permissionLevel != config.permissionLevels.NORMAL_USER) {
                        res.status(404).send({ errors: ['User Not Found'] });
                    } else if (user.dataValues.status == 0) {
                        res.status(404).send({ errors: ['User is Blocked'] });
                    } else {
                        if (user.dataValues.otp == req.body.otp) {
                            req.body.userId = user.dataValues.id;
                            return next();
                        }else{
                            res.status(404).send({ errors: ['OTP is not matched'] });
                        }
                    }
                },err=>{
                    return res.status(406).send({ errors:err });
                });
        }, 
        UsersController.resetPassword
    ]);
};