const Sequelize = require('sequelize');
const config = require('../../configs/env');
const multer = require('multer');
const env = require('../../configs/env');
const sequelize = require('../../configs/connection');
const crypto = require('crypto');
const Op = Sequelize.Op;
const jwtSecret = require('../../configs/env').jwt_secret,
    jwt = require('jsonwebtoken');
const SendMail = require('../send-email/index');

const User = require('../../models/user')(sequelize, Sequelize);
const BookingLoyalty = require('../../models/booking-loyalty')(sequelize, Sequelize);
const UserLoyalty = require('../../models/user-loyalty')(sequelize, Sequelize);
const Booking = require('../../models/booking')(sequelize, Sequelize);
User.hasMany(BookingLoyalty, { as: 'bookingLoyalty' });
User.hasMany(UserLoyalty, { as: 'userLoyalty' });
UserLoyalty.belongsTo(Booking, { as: 'booking' });
// User.sync();
UserLoyalty.sync();
exports.uploadImage = multer({
    storage: multer.diskStorage({
        destination: 'uploads/profile/',
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    })
}).single('profileImage');
exports.validateDuplicate = (body) => {
    return new Promise((resolve, reject) => {
        User.findOne({
            where: {
                email: body.email
            }
        }).then(user => {
            User.findOne({
                where: {
                    phone: body.phone
                }
            }).then(user1 => {
                if (user != null) {
                    if (user1 != null) {
                        reject({ message: "Phone and email already exist..!!!" });
                    } else {
                        reject({ message: "Email already exist..!!!" });
                    }
                } else {
                    if (user1 != null) {
                        reject({ message: "Phone already exist..!!!" });
                    } else {
                        resolve(body);
                    }
                }
            }, err => {
                reject({ message: "User create failed..!!!" });
            });
        }, err => {
            reject({ message: "User create failed..!!!" });
        });
    });
};
exports.createUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.create(userData).then(user => {
            console.log("create user : ", user);
            user.dataValues.password = undefined;
            let refreshId = user.dataValues.id + jwtSecret;
            let salt = crypto.randomBytes(16).toString('base64');
            let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
            let token = jwt.sign({
                userId: user.dataValues.id,
                email: user.dataValues.email,
                phone: user.dataValues.phone,
                permissionLevel: user.dataValues.permissionLevel,
                provider: 'email',
                name: user.dataValues.fName + ' ' + user.dataValues.lName,
                image: user.dataValues.image
            }, jwtSecret);
            let b = new Buffer(hash);
            let refresh_token = b.toString('base64');
            let resData = {
                accessToken: token,
                refreshToken: refresh_token,
                userId: user.dataValues.id,
                permissionLevel: user.dataValues.permissionLevel,
                name: user.dataValues.fName + ' ' + user.dataValues.lName,
                image: user.dataValues.image
            };
            let data = {
                id: user.dataValues.id,
                fName: user.dataValues.fName,
                lName: user.dataValues.lName,
                phone: user.dataValues.phone,
                email: user.dataValues.email,
                status: user.dataValues.status,
                permissionLevel: user.dataValues.permissionLevel,
                auth: resData
            }
            resolve(data);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.registerMail = (body) => {
    return new Promise((resolve, reject) => {
        if (body.email) {
            let content = `
            <div style="
                border-radius: 20px;
                border: 1px solid #e1e1e1d1;
                padding: 50px;
                margin-bottom: 60px;
            ">
                <p><b>Dear ${body.fName},</p> 
                <p>Thank you for registering for La Villa Website. Your registration has been successfully completed </p> 
                <p>If you would like to view your registration details, you can login here. You registered with this email: ${body.email}. If you forgot your password, simply hit “Forgot password” and you’ll be prompted to reset it. </p> 
                <p>If you have any questions please feel free to contact us. </p> 

            </div>
            `
            SendMail.sendEmail(body.email, "Registration Completed", content).then(resMail => {
                resolve(body.data);
            }, errMail => {
                reject({ error: errMail });
            })
        } else {
            resolve({ message: "Status Updated" });
        }
    });
};
exports.editUser = (body, id) => {
    return new Promise((resolve, reject) => {
        User.update({
            fName: body.fName,
            lName: body.lName,
            status: body.status,
            image: body.image,
            phone: body.phone,
            email: body.email
        }, {
            where: {
                id: id
            }
        }).then(user => {
            console.log(user);
            if (user.length == 0) {
                reject({ message: "User update faild..!!!" });
            } else {
                resolve({ message: "User updated..!!!" });
            }
        }, err => {
            reject({ message: "User update faild..!!!" });
        });
    });
};
exports.getUser = (userId) => {
    return new Promise((resolve, reject) => {
        User.findByPk(userId, {
            attributes: ['id', 'fName', 'lName', 'phone', 'email', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')), 'image'], 'status']
        }).then(user => {
            resolve(user);
        }, err => {
            reject({ message: "User update faild..!!!" });
        });
    });
};
exports.blockCustomer = (userId) => {
    return new Promise((resolve, reject) => {
        User.update({
            status: 0
        },
            {
                where: {
                    id: userId
                }
            }).then(user => {
                resolve({ message: "Update Successfully..!!" });
            }, err => {
                reject({ message: "User update faild..!!!" });
            });
    });
};
exports.enableCustomer = (userId) => {
    return new Promise((resolve, reject) => {
        User.update({
            status: 1
        },
            {
                where: {
                    id: userId
                }
            }).then(user => {
                resolve({ message: "Update Successfully..!!" });
            }, err => {
                reject({ message: "User update faild..!!!" });
            });
    });
};
exports.findAllUser = () => {
    return new Promise((resolve, reject) => {
        User.findAll({
            attributes: ['id', 'fName', 'lName', 'phone', 'email', 'permissionLevel']
        }).then(users => {
            resolve(users);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.findAllAdminUser = (body) => {
    return new Promise((resolve, reject) => {
        let page = (body.start + body.length) / body.length;
        let attributes = [];
        body.columns.map(c => {
            if (c.data == "image") {
                attributes.push([Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')), 'image']);
            } else {
                attributes.push(c.data);
            }
        })
        let orderC = (body.order[0].column == 0) ? ('image') : (attributes[body.order[0].column]);
        let orderD = body.order[0].dir;
        const options = {
            attributes: attributes,
            page: page,
            paginate: body.length,
            order: [[orderC, orderD]],
            where: {
                [Op.or]: [
                    { fName: { [Op.like]: `%${body.search.value}%` } },
                    { lName: { [Op.like]: `%${body.search.value}%` } },
                    { email: { [Op.like]: `%${body.search.value}%` } },
                    { phone: { [Op.like]: `%${body.search.value}%` } },
                ],
                permissionLevel: config.permissionLevels.ADMIN
            }
        }
        User.paginate(options).then(res => {
            let response = {
                draw: body.draw,
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "User get failed..!!!" });
        })
    });
};
exports.findAllCustomers = (body) => {
    return new Promise((resolve, reject) => {
        let page = (body.start + body.length) / body.length;
        let attributes = [];
        body.columns.map(c => {
            if (c.data == "image") {
                attributes.push([Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')), 'image']);
            } else {
                attributes.push(c.data);
            }
        })
        let orderC = (body.order[0].column == 0) ? ('image') : (attributes[body.order[0].column]);
        let orderD = body.order[0].dir;
        const options = {
            attributes: attributes,
            page: page,
            paginate: body.length,
            order: [[orderC, orderD]],
            where: {
                [Op.or]: [
                    { fName: { [Op.like]: `%${body.search.value}%` } },
                    { lName: { [Op.like]: `%${body.search.value}%` } },
                    { email: { [Op.like]: `%${body.search.value}%` } },
                    { phone: { [Op.like]: `%${body.search.value}%` } },
                ],
                permissionLevel: config.permissionLevels.NORMAL_USER
            }
        }
        User.paginate(options).then(res => {
            let response = {
                draw: body.draw,
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "User get failed..!!!" });
        })
    });
};
exports.findAllActiveAdminUser = () => {
    return new Promise((resolve, reject) => {
        User.findAll({
            attributes: ['id', 'fName', 'lName', 'phone', 'email', 'permissionLevel'],
            where: {
                permissionLevel: config.permissionLevels.ADMIN,
                status: 1
            }
        }).then(users => {
            resolve(users);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.findAllNormalUser = () => {
    return new Promise((resolve, reject) => {
        User.findAll({
            attributes: ['id', 'fName', 'lName', 'phone', 'email', 'permissionLevel'],
            where: {
                permissionLevel: config.permissionLevels.NORMAL_USER,
                status: 1
            }
        }).then(users => {
            resolve(users);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.findUserByPhone = (phone) => {
    return new Promise((resolve, reject) => {
        User.findOne({ where: { phone: phone } }).then(user => {
            resolve(user);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        User.findOne({ where: { email: email } }).then(user => {
            resolve(user);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.findUserById = (id) => {
    return new Promise((resolve, reject) => {
        User.findByPk(id).then(user => {
            if (user == null) {
                reject({ status: 404, message: "User not found" });
            }
            resolve(user);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.deleteUserById = (id) => {
    return new Promise((resolve, reject) => {
        User.destroy({
            where: {
                id: id
            }
        }).then(() => {
            resolve({ message: "Delete Successfully!!!" });
        }, err => {
            reject({ error: err });
        });
    });
};
exports.getUserDetail = (id) => {
    return new Promise((resolve, reject) => {
        User.findOne({
            attributes: ['id', 'fName', 'lName', 'phone', 'email', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')), 'image'], 'availablePoint'],
            where: { id: id }
        }).then(user => {
            resolve(user);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.updateUserDetail = (id, body) => {
    return new Promise((resolve, reject) => {
        User.update({
            fName: body.fName,
            lName: body.lName,
            phone: body.phone,
            email: body.email
        }, {
            where: {
                id: id
            }
        }).then(user => {
            console.log(user);
            if (user.length == 0) {
                reject({ message: "User update faild..!!!" });
            } else {
                resolve({ message: "User updated..!!!" });
            }
        }, err => {
            reject({ message: "User update faild..!!!" });
        });
    });
};
exports.updateUserImage = (id, image) => {
    return new Promise((resolve, reject) => {
        User.update({
            image: image
        }, {
            where: {
                id: id
            }
        }).then(user => {
            console.log(user);
            if (user.length == 0) {
                reject({ message: "User Image update faild..!!!" });
            } else {
                resolve({ message: "User Image updated..!!!" });
            }
        }, err => {
            reject({ message: "User Image update faild..!!!" });
        });
    });
};
exports.updateUserPassword = (password, id) => {
    return new Promise((resolve, reject) => {
        User.update({
            password: password
        }, {
            where: {
                id: id
            }
        }).then(user => {
            console.log(user);
            if (user.length == 0) {
                reject({ message: "User Password update faild..!!!" });
            } else {
                User.findByPk(id).then(user => {
                    let refreshId = user.dataValues.id + jwtSecret;
                    let salt = crypto.randomBytes(16).toString('base64');
                    let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
                    let token = jwt.sign({
                        userId: user.dataValues.id,
                        email: user.dataValues.email,
                        phone: user.dataValues.phone,
                        permissionLevel: user.dataValues.permissionLevel,
                        provider: 'email',
                        name: user.dataValues.fName + ' ' + user.dataValues.lName,
                        image: user.dataValues.image
                    }, jwtSecret);
                    let b = new Buffer(hash);
                    let refresh_token = b.toString('base64');
                    let resData = {
                        accessToken: token,
                        refreshToken: refresh_token,
                        userId: user.dataValues.id,
                        permissionLevel: user.dataValues.permissionLevel,
                        name: user.dataValues.fName + ' ' + user.dataValues.lName,
                        image: user.dataValues.image
                    };
                    resolve({ message: "User Password updated..!!!", data: resData });
                }, err => {
                    reject({ message: "User Password update faild..!!!" });
                });


            }
        }, err => {
            reject({ message: "User Password update faild..!!!" });
        });
    });
};
exports.getLoyalties = (id) => {
    return new Promise((resolve, reject) => {
        User.findOne({
            where: {
                id: id
            },
            attributes: ['id', 'availablePoint'],
            include: [
                {
                    attributes: ['point', 'userId', 'bookingId', 'createdAt'],
                    model: UserLoyalty, as: 'userLoyalty',
                    group: ['id']
                },
                {
                    attributes: ['usedPoint', 'createdAt', 'id', 'bookingId'],
                    model: BookingLoyalty, as: 'bookingLoyalty',
                    group: ['id']
                }
            ]
        }).then(user => {
            resolve(user);
        }, err => {
            reject({ message: "User Loyalty get faild..!!!", err: err });
        });
    });
};
exports.getOTP = (body) => {
    return new Promise((resolve, reject) => {
        User.findOne({
            where: {
                email: body.email
            }
        }).then(user => {
            let otp = '';
            let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let len = str.length;
            for (let i = 0; i < 8; i++) {
                otp += str[Math.floor(Math.random() * len)];
            }
            User.update({
                otp: otp
            }, {
                where: {
                    id: user.dataValues.id
                }
            }).then(u => {
                let content = `
                <div style="
                    border-radius: 20px;
                    border: 1px solid #e1e1e1d1;
                    padding: 50px;
                    margin-bottom: 60px;
                ">
                    <p><b>Dear ${user.dataValues.fName},</p> 
                    <p>We generate the OTP string, Please find the string below</p>

                    <div style="margin-left:40%;margin-right:40%;background-color:#eee;text-align:center;padding:25px;border-radius:10px;font-size:25px">${otp}</div>

                </div>
                `
                SendMail.sendEmail(user.dataValues.email, "Forget Password OTP", content).then(resMail => {
                    resolve({ message: "Status Updated" });
                }, errMail => {
                    reject({ error: errMail });
                })
            }, err => {
                reject({ message: "User Loyalty get faild..!!!", err: err });
            });
        }, err => {
            reject({ message: "User Loyalty get faild..!!!", err: err });
        });
    });
};
exports.resetPassword = (password, id) => {
    return new Promise((resolve, reject) => {
        User.update({
            password: password
        }, {
            where: {
                id: id
            }
        }).then(user => {
            console.log(user);
            if (user.length == 0) {
                reject({ message: "User Password update faild..!!!" });
            } else {
                User.findByPk(id).then(user => {
                    let refreshId = user.dataValues.id + jwtSecret;
                    let salt = crypto.randomBytes(16).toString('base64');
                    let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
                    let token = jwt.sign({
                        userId: user.dataValues.id,
                        email: user.dataValues.email,
                        phone: user.dataValues.phone,
                        permissionLevel: user.dataValues.permissionLevel,
                        provider: 'email',
                        name: user.dataValues.fName + ' ' + user.dataValues.lName,
                        image: user.dataValues.image
                    }, jwtSecret);
                    let b = new Buffer(hash);
                    let refresh_token = b.toString('base64');
                    let resData = {
                        accessToken: token,
                        refreshToken: refresh_token,
                        userId: user.dataValues.id,
                        permissionLevel: user.dataValues.permissionLevel,
                        name: user.dataValues.fName + ' ' + user.dataValues.lName,
                        image: user.dataValues.image
                    };
                    let content = `
                    <div style="
                        border-radius: 20px;
                        border: 1px solid #e1e1e1d1;
                        padding: 50px;
                        margin-bottom: 60px;
                    ">
                        <p><b>Dear ${user.dataValues.fName},</p> 
                        <p>Your password reset is completed</p>

                    </div>
                    `
                    SendMail.sendEmail(user.dataValues.email, "Password reset completed", content).then(resMail => {
                        resolve({ message: "Status Updated" });
                    }, errMail => {
                        reject({ error: errMail });
                    })
                    resolve({ message: "User Password updated..!!!", data: resData });
                }, err => {
                    reject({ message: "User Password update faild..!!!" });
                });
            }
        }, err => {
            reject({ message: "User Password update faild..!!!" });
        });
    });
};