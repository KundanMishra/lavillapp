const Sequelize = require('sequelize');
const sequelize = require('../../configs/connection');
const ADMIN_USER = require('../../configs/env').permissionLevels.ADMIN;
const Amenities = require('../../models/amenities')(sequelize, Sequelize);
const AmenitiesType = require('../../models/amenities-type')(sequelize, Sequelize);
const AmenitiesIcon = require('../../models/amenities-icon')(sequelize, Sequelize);
const Op = Sequelize.Op;
Amenities.belongsTo(AmenitiesType);
Amenities.belongsTo(AmenitiesIcon, { as: "amenitiesIcon" });
Amenities.sync();
exports.createAmenities = (amenitiesData) => {
    return new Promise((resolve, reject) => {
        Amenities.create(amenitiesData).then(amenities => {
            resolve(amenities);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.editAmenities = (body, id) => {
    return new Promise((resolve, reject) => {
        Amenities.update(body, {
            where: {
                id: id
            }
        }).then(amenities => {
            console.log("Printing amenities : ", amenities);
            if (amenities.length == 0) {
                reject({ message: "Amenities update failed..!!!" });
            } else {
                resolve({ message: "Amenities updated..!!!" });
            }
        }, err => {
            reject({ message: "Amenities update failed..!!!" });
        });
    });
};
exports.getAmenities = (amenitiesId) => {
    return new Promise((resolve, reject) => {
        Amenities.findByPk(amenitiesId, {
            attributes: ['id', 'name', 'nameAr', 'amenitiesIconId', 'amenitiesTypeId']
        }).then(amenities => {
            resolve(amenities);
        }, err => {
            reject({ message: "Amenities update failed..!!!" });
        });
    });
};
exports.findAllAmenities = () => {
    return new Promise((resolve, reject) => {
        Amenities.findAll({
            attributes: ['id', 'name', 'nameAr']
        }).then(amenities => {
            resolve(amenities);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.findAllRoomAmenities = () => {
    return new Promise((resolve, reject) => {
        Amenities.findAll({
            attributes: ['id', 'name', 'nameAr'],
            where: {
                amenitiesTypeId: 1
            }
        }).then(amenities => {
            resolve(amenities);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.findAllPropertyAmenities = () => {
    return new Promise((resolve, reject) => {
        Amenities.findAll({
            attributes: ['id', 'name', 'nameAr'],
            where: {
                amenitiesTypeId: 2
            }
        }).then(amenities => {
            resolve(amenities);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.listAllAmenities = (body) => {
    return new Promise((resolve, reject) => {

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
        console.log("amenities model body", body);
        Amenities.paginate(options).then(res => {
            let response = {
                draw: body.draw,
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "Amenities get failed..!!!" });
        })
    });
};
exports.findAllAmenitiesType = () => {
    return new Promise((resolve, reject) => {
        AmenitiesType.findAll({
            attributes: ['id', 'name', 'nameAr']
        }).then(amenities => {
            resolve(amenities);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.findAllAmenitiesIcon = () => {
    return new Promise((resolve, reject) => {
        AmenitiesIcon.findAll({
            attributes: ['id', 'name', 'value']
        }).then(amenities => {
            resolve(amenities);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.checkTheUserIsAdmin = (selectedUserId) => {
    return new Promise((resolve, reject) => {
        User.findOne({
            where: {
                id: selectedUserId,
                permissionLevel: ADMIN_USER
            },
        }).then(user => {
            resolve(user);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.deleteAmenities = (amenitiesId) => {
    return new Promise((resolve, reject) => {
        Amenities.destroy({
            where: {
                id: amenitiesId
            },
        }).then(amenities => {
            console.log(amenities);
            if (amenities == 0) {
                reject({ message: "Amenities delete failed..!!!" });
            } else {
                resolve({ message: "Amenities deleted..!!!" });
            }
        }, err => {
            reject({ message: "Amenities delete failed..!!!" });
        });
    });
};

exports.setAmenitiesFeatured = (id) => {
    return new Promise((resolve, reject) => {
        Amenities.update({
            featured: 1
        }, {
            where: {
                id: id
            }
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.setAmenitiesUnfeatured = (id) => {
    return new Promise((resolve, reject) => {
        Amenities.update({
            featured: 0
        }, {
            where: {
                id: id
            }
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.listFeaturedAmenities = () => {
    return new Promise((resolve, reject) => {
        Amenities.findAll({
            where: {
                featured: 1
            },
            attributes: [
                'id', 'name', 'nameAr'
            ],
            include: [
                {
                    attributes: ['id', 'name'],
                    model: AmenitiesIcon, as: 'amenitiesIcon'
                }
            ]
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};