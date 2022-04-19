const UserModel = require('./user.model');
const crypto = require('crypto');
const fs = require('fs');

exports.validateDuplicate = (req, res,next) => {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
    req.body.permissionLevel = 1;
    if (req.file) {
        req.body.image = `uploads/profile/${req.file.filename}`;
    }
    UserModel.validateDuplicate(req.body)
        .then((result) => {
            req.body = result;
            next();
        }, err => {
            res.status(406).send(err);
        });
};
exports.insert = (req, res,next) => {
    UserModel.createUser(req.body)
        .then((result) => {
            req.body.data = result;
            next()
        }, err => {
            res.status(406).send(err);
        });
};
exports.registerMail = (req, res) => {
    UserModel.registerMail(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.adminCreate = (req, res) => {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
    req.body.permissionLevel = 2048;
    if (req.file) {
        req.body.image = `uploads/profile/${req.file.filename}`;
    }

    UserModel.createUser(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.editUser = (req, res) => {
    if (req.file) {
        UserModel.findUserById(req.params.userId)
            .then((result) => {
                if (result.image != null) {
                    req.body.image = `uploads/profile/${req.file.filename}`;
                    UserModel.editUser(req.body, req.params.userId)
                        .then((result) => {
                            res.status(200).send(result);
                        }, err => {
                            res.status(406).send(err);
                        });
                    if (result.image) {
                        fs.unlinkSync(result.image);
                    }
                } else {
                    req.body.image = `uploads/profile/${req.file.filename}`;
                    UserModel.editUser(req.body, req.params.userId)
                        .then((result) => {
                            res.status(200).send(result);
                        }, err => {
                            res.status(406).send(err);
                        });
                }
            }, err => {
                res.status(406).send(err);
            });

    } else {
        UserModel.editUser(req.body, req.params.userId)
            .then((result) => {
                res.status(200).send(result);
            }, err => {
                res.status(406).send(err);
            });
    }


};

exports.getUser = (req, res) => {
    UserModel.getUser(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.findAllUser = (req, res) => {
    UserModel.findAllUser()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.findAllAdminUser = (req, res) => {
    UserModel.findAllAdminUser(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.findAllCustomers = (req, res) => {
    UserModel.findAllCustomers(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.blockCustomer = (req, res) => {
    UserModel.blockCustomer(req.params.id)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.enableCustomer = (req, res) => {
    UserModel.enableCustomer(req.params.id)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.findAllNormalUser = (req, res) => {
    UserModel.findAllNormalUser()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.findAllActiveAdminUser = (req, res) => {
    UserModel.findAllActiveAdminUser()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};

exports.deleteUser = (req, res) => {
    let id = req.params.userId;
    UserModel.findUserById(id)
        .then((result) => {
            
            UserModel.deleteUserById(id)
                .then((r) => {
                    res.status(200).send(r);
                }, err1 => {
                    res.status(406).send(err1);
                });
            if (result.image != null) {
                fs.unlinkSync(result.image);
            }
        }, err => {
            res.status(406).send(err);
        });

};
exports.getUserDetail = (req, res) => {
    console.log(req.body.userId);
    UserModel.getUserDetail(req.jwt.userId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.updateUserDetail = (req, res) => {
    console.log(req.body.userId);
    UserModel.updateUserDetail(req.jwt.userId, req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.updateUserImage = (req, res) => {
    UserModel.findUserById(req.jwt.userId)
        .then((result) => {
            if (result.image != null) {
               
                let image = `uploads/profile/${req.file.filename}`;
                UserModel.updateUserImage(req.jwt.userId, image)
                    .then((result) => {
                        res.status(200).send(result);
                    }, err => {
                        res.status(406).send(err);
                    });
                if (result.image) {
                    fs.unlinkSync(result.image);
                }
            } else {
                let image = `uploads/profile/${req.file.filename}`;
                UserModel.updateUserImage(req.jwt.userId, image)
                    .then((result) => {
                        res.status(200).send(result);
                    }, err => {
                        res.status(406).send(err);
                    });
            }
        }, err => {
            res.status(406).send(err);
        });
};
exports.updateUserPassword = (req, res) => {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.newPassword).digest("base64");
    let password = salt + "$" + hash; 

    UserModel.updateUserPassword(password,req.jwt.userId)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getLoyalties = (req, res) => {
    UserModel.getLoyalties(req.jwt.userId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.getOTP = (req, res) => {
    UserModel.getOTP(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.resetPassword = (req, res) => {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    let password = salt + "$" + hash; 

    UserModel.resetPassword(password,req.body.userId)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};