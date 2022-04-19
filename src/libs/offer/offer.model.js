const Sequelize = require('sequelize');
const Op = Sequelize.Op; 
const fs = require('fs');
const env = require('../../configs/env');
const sequelize = require('../../configs/connection');
const Offer = require('../../models/offer')(sequelize, Sequelize);
const Room = require('../../models/room')(sequelize, Sequelize);
const RoomCategory = require('../../models/room-category')(sequelize, Sequelize);
const Branch = require('../../models/branch')(sequelize, Sequelize);


Offer.belongsTo(Room, { as: 'room' });
Room.belongsTo(Branch, { as: 'branch' });
Room.belongsTo(RoomCategory, { as: 'roomCategory' });
Offer.sync();


exports.createOffer = (offerData) => {
    return new Promise((resolve, reject) => {
        Offer.create(offerData).then(offer => {
            resolve(offer);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.editOffer = (body, id) => {
    return new Promise((resolve, reject) => {
        Offer.update(body, {
            where: {
                id: id
            }
        }).then(offer => {
            console.log(offer);
            if (offer.length == 0) {
                reject({ message: "Offer update failed..!!!" });
            } else {
                resolve({ message: "Offer updated..!!!" });
            }
        }, err => {
            reject({ message: "Offer update failed..!!!" });
        });
    });
};
exports.getOffer = (offerId) => {
    return new Promise((resolve, reject) => {
        Offer.findByPk(offerId, {
            attributes: ['id','offerPercent','status','roomId'],
            include: [
                {
                    attributes: ['id'],
                    model: Room, as: 'room',
                    include: [
                        {
                            attributes: ['id', 'name', 'nameAr'],
                            model: RoomCategory, as: 'roomCategory'
                        },
                        {
                            attributes: ['id', 'name', 'nameAr'],
                            model: Branch, as: 'branch'
                        }
                    ]
                }
            ]
        }).then(offer => {
            resolve(offer);
        }, err => {
            reject({ message: "Offer update failed..!!!" });
        });
    });
};
exports.findAllOffer = (body) => {
    return new Promise((resolve, reject) => { 
        let page = (body.start + body.length) / body.length;
        let attributes = [];
        body.columns.map(c => {
            attributes.push(c.data);
        }) 
        let orderC = attributes[body.order[0].column];
        let orderD = body.order[0].dir;
        const options = {
            attributes: attributes,
            page: page,
            paginate: body.length,
            order: [[orderC, orderD]],
            include:[
                {
                    attributes: ['id'],
                    model: Room, as: 'room',
                    include: [
                        {
                            attributes: ['id', 'name'],
                            model: RoomCategory, as: 'roomCategory',
                            where: { name: { [Op.like]: `%${body.search.value}%` } },
                        },
                        {
                            attributes: ['id', 'name'],
                            model: Branch, as: 'branch',
                            where: { name: { [Op.like]: `%${body.search.value}%` } },
                        }
                    ]
                }
            ]
        }
        Offer.paginate(options).then(res => {
            console.log(res);
            let response = {
                draw:body.draw,
                recordsTotal:res.total,
                recordsFiltered:res.total,
                data:res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "Offer get failed..!!!",err:err });
        })
    });
};
exports.listAllOffer = () => {
    return new Promise((resolve, reject) => {
        Offer.findAll({
            attributes:['id','offerPercent','status'],
            include: [
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: RoomCategory, as: 'roomCategory'
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: Branch, as: 'branch'
                }
            ]
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ message: "Offer get failed..!!!" });
        })
    });
};
exports.getAllOffer = () => {
    return new Promise((resolve, reject) => {
        Offer.findAll({
            attributes: ['id','offerPercent','status'],
            include: [
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: RoomCategory, as: 'roomCategory'
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: Branch, as: 'branch'
                }
            ]
        }).then(offer => {
            resolve(offer);
        }, err => {
            reject({ message: "Offer update failed..!!!" });
        });
    });
};
exports.deleteOffer = (offerId) => {
    return new Promise((resolve, reject) => {
        Offer.destroy({
            where: {
                id: offerId
            },
        }).then(offer => {
            console.log(offer);
            if (offer == 0) {
                reject({ message: "Offer delete failed..!!!" });
            } else {
                resolve({ message: "Offer deleted..!!!" });
            }
        }, err => {
            reject({ message: "Offer delete failed..!!!" });
        });
    });
};