const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const fs = require('fs');
const env = require('../../configs/env');
const sequelize = require('../../configs/connection');
const Event = require('../../models/event')(sequelize, Sequelize);
Event.sync();
exports.uploadEventImage = multer({
    storage: multer.diskStorage({
        destination: 'uploads/events/',
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    })
}).single('eventImage');
exports.createEvent = (eventData) => {
    return new Promise((resolve, reject) => {
        Event.create(eventData).then(event => {
            resolve(event);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.editEvent = (body, id) => {
    return new Promise((resolve, reject) => {
        
        Event.update(body, {
            where: {
                id: id
            }
        }).then(event => {
            console.log(event);
            if (event.length == 0) {
                reject({ message: "Event update failed..!!!" });
            } else {
                resolve({ message: "Event updated..!!!" });
            }
        }, err => {
            reject({ message: "Event update failed..!!!" });
        });
        if (body.image) {
            Event.findByPk(id).then(res => {
                if (res.dataValues.image) {
                    fs.unlinkSync(res.dataValues.image);
                }

            })
        }
    });
};
exports.getEvent = (eventId) => {
    return new Promise((resolve, reject) => {
        Event.findByPk(eventId, {
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')), 'image'], 'date', 'featured']
        }).then(event => {
            resolve(event);
        }, err => {
            reject({ message: "Event update failed..!!!" });
        });
    });
};
exports.setEventFeatured = (eventId) => {
    return new Promise((resolve, reject) => {
        Event.update({ featured: 1 }, {
            where: {
                id: eventId
            }
        }).then(event => {
            resolve(event);
        }, err => {
            reject({ message: "Event update failed..!!!" });
        });
    });
};
exports.setEventUnfeatured = (eventId) => {
    return new Promise((resolve, reject) => {
        Event.update({ featured: 0 }, {
            where: {
                id: eventId
            }
        }).then(event => {
            resolve(event);
        }, err => {
            reject({ message: "Event update failed..!!!" });
        });
    });
};
exports.findAllEvent = (body) => {
    return new Promise((resolve, reject) => {
        console.log(body);
        let page = (body.start + body.length) / body.length;
        let attributes = [];
        body.columns.map(c => {
            attributes.push(c.data);
        })
        attributes.push('featured');
        let orderC = attributes[body.order[0].column];
        let orderD = body.order[0].dir;
        const options = {
            attributes: attributes,
            page: page,
            paginate: body.length,
            order: [[orderC, orderD]],
            where: { name: { [Op.like]: `%${body.search.value}%` } }
        }
        Event.paginate(options).then(res => {
            let response = {
                draw: body.draw,
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "Event get failed..!!!", err: err });
        })
    });
};
exports.listAllEvent = () => {
    return new Promise((resolve, reject) => {
        Event.findAll({
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')), 'image'], 'date', 'featured']
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ message: "Event get failed..!!!" });
        })
    });
};
exports.listFeaturedEvent = () => {
    return new Promise((resolve, reject) => {
        Event.findAll({
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')), 'image'], 'date', 'featured'],
            where: {
                featured: true
            }
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ message: "Event get failed..!!!" });
        })
    });
};
exports.getAllEvent = () => {
    return new Promise((resolve, reject) => {
        Event.findAll({
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')), 'image'], 'date', 'featured']
        }).then(event => {
            resolve(event);
        }, err => {
            reject({ message: "Event update failed..!!!" });
        });
    });
};
exports.deleteEvent = (eventId) => {
    return new Promise((resolve, reject) => {
        Event.findByPk(eventId).then(res => {
           
            Event.destroy({
                where: {
                    id: eventId
                },
            }).then(event => {
                console.log(event);
                if (event == 0) {
                    reject({ message: "Event delete failed..!!!" });
                } else {
                    resolve({ message: "Event deleted..!!!" });
                }
            }, err => {
                reject({ message: "Event delete failed..!!!" });
            });
            if (res.dataValues.image) {
                fs.unlinkSync(res.dataValues.image);
            }
        }, err => {
            reject({ message: "Event delete failed..!!!" });
        })

    });
};