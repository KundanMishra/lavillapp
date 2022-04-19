const UserModel = require('../libs/user/user.model');
const crypto = require('crypto');
const config = require('../configs/env');
exports.hasAuthValidFields = (req, res, next) => {
    let errors = [];
    if (req.body) {
        if (!req.body.email) {
            errors.push('Missing Email field');
        }
        if (!req.body.password) {
            errors.push('Missing password field');
        }

        if (errors.length) {
            return res.status(400).send({ errors: errors.join(',') });
        } else {
            return next();
        }
    } else {
        return res.status(400).send({ errors: 'Missing Email and password fields' });
    }
};

exports.isPasswordAndUserMatch = (req, res, next) => {
    UserModel.findUserByEmail(req.body.email)
        .then((user) => {
            if (!user) {
                res.status(404).send({});
            } else if (user.permissionLevel != config.permissionLevels.NORMAL_USER) {
                res.status(404).send({ errors: ['User Not Found'] });
            } else if (user.status == 0) {
                res.status(404).send({ errors: ['User is Blocked'] });
            } else {
                let passwordFields = user.password.split('$');
                let salt = passwordFields[0];

                let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                if (hash === passwordFields[1]) {
                    req.body = {
                        userId: user.id,
                        email: user.email,
                        phone: user.phone,
                        permissionLevel: user.permissionLevel,
                        provider: 'email',
                        name: user.fName+' '+user.lName,
                        image:user.image,
                        availablePoint: user.availablePoint,
                    };
                    return next();
                } else {
                    return res.status(400).send({ errors: ['Invalid Credential'] });
                }
            }
        });
};
exports.adminHasAuthValidFields = (req, res, next) => {
    let errors = [];
    if (req.body) {
        if (!req.body.email) {
            errors.push('Missing Email field');
        }
        if (!req.body.password) {
            errors.push('Missing password field');
        }

        if (errors.length) {
            return res.status(400).send({ errors: errors.join(',') });
        } else {
            return next();
        }
    } else {
        return res.status(400).send({ errors: 'Missing Email and password fields' });
    }
};

exports.adminIsPasswordAndUserMatch = (req, res, next) => {
    UserModel.findUserByEmail(req.body.email)
        .then((user) => {
            if (!user) {
                console.log('test1');
                res.status(404).send({ errors: ['User Not Found'] });
            } else if (user.permissionLevel != config.permissionLevels.SUPER_ADMIN) {
                console.log('test2');
                res.status(404).send({ errors: ['User Not Found'] });
            } else {
                let passwordFields = user.password.split('$');
                let salt = passwordFields[0];

                let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                if (hash === passwordFields[1]) {
                    req.body = {
                        userId: user.id,
                        email: user.email,
                        permissionLevel: user.permissionLevel,
                        provider: 'email',
                        name: user.fName+' '+user.lName,
                    };
                    return next();
                } else {
                    return res.status(400).send({ errors: ['Invalid Credential'] });
                }
            }
        });
}; 
exports.branchIsPasswordAndUserMatch = (req, res, next) => {
    UserModel.findUserByEmail(req.body.email)
        .then((user) => {
            if (!user) {
                console.log('test1');
                res.status(404).send({ errors: ['User Not Found'] });
            } else if (user.permissionLevel != config.permissionLevels.ADMIN) {
                console.log('test2');
                res.status(404).send({ errors: ['User Not Found'] });
            } else {
                let passwordFields = user.password.split('$');
                let salt = passwordFields[0];

                let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                if (hash === passwordFields[1]) {
                    req.body = {
                        userId: user.id,
                        email: user.email,
                        permissionLevel: user.permissionLevel,
                        provider: 'email',
                        name: user.fName+' '+user.lName,
                    };
                    return next();
                } else {
                    return res.status(400).send({ errors: ['Invalid Credential'] });
                }
            }
        });
}; 