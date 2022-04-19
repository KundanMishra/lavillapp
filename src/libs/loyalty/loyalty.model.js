const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { QueryTypes } = require('sequelize');
const sequelize = require('../../configs/connection');
const Loyalty = require('../../models/loyalty')(sequelize, Sequelize);
Loyalty.sync();
exports.createLoyalty = (loyaltyData) => {
    return new Promise((resolve, reject) => {
        Loyalty.create(loyaltyData).then(loyalty => {
            resolve(loyalty);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.getLoyalty = (loyaltyId) => {
    return new Promise((resolve, reject) => {
        Loyalty.findByPk(loyaltyId, {
            attributes: ['id','minTotalBookingAmountPassLoyalty','oneQAREqualPoint','minTotalBookingAmountForUsing','minTotalBookingAmountToGetLoyalty','createdAt']
        }).then(loyalty => {
            resolve(loyalty);
        }, err => {
            reject({ message: "Loyalty update failed..!!!" });
        });
    });
};
exports.getLastLoyalty = () => {
    return new Promise((resolve, reject) => {
        Loyalty.findOne({
            attributes: ['id','minTotalBookingAmountPassLoyalty','oneQAREqualPoint','minTotalBookingAmountForUsing','minTotalBookingAmountToGetLoyalty','createdAt'],
            order:[['id', 'DESC'],]
        }).then(loyalty => {
            resolve(loyalty);
        }, err => {
            reject({ message: "Loyalty update failed..!!!" });
        });
    });
};
exports.findAllLoyalty = (body) => {
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
            order: [[orderC, orderD]]
        }
        Loyalty.paginate(options).then(res => {
            let response = {
                draw:body.draw,
                recordsTotal:res.total,
                recordsFiltered:res.total,
                data:res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "Loyalty get failed..!!!" });
        })
    });
};
exports.getAllLoyalty = () => {
    return new Promise((resolve, reject) => {
        Loyalty.findAll({
            attributes: ['id','minTotalBookingAmountPassLoyalty','oneQAREqualPoint','minTotalBookingAmountForUsing','minTotalBookingAmountToGetLoyalty','createdAt']
        }).then(loyalty => {
            resolve(loyalty);
        }, err => {
            reject({ message: "Loyalty update failed..!!!" });
        });
    });
};