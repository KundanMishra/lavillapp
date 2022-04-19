const Sequelize = require('sequelize'); 
const SendMail = require('../send-email/index');
const _ = require('underscore');
const moment = require('moment');
const sequelize = require('../../configs/connection');
const Op = Sequelize.Op; 
const PromoCode = require('../../models/promo-code')(sequelize, Sequelize);
const User = require('../../models/user')(sequelize, Sequelize);
const UserPromoCode = require('../../models/user-promo-code')(sequelize, Sequelize);
const Branch = require('../../models/branch')(sequelize, Sequelize);
PromoCode.belongsToMany(User, { through: UserPromoCode });
PromoCode.belongsTo(Branch, { as:"branch"});
PromoCode.sync();
UserPromoCode.sync();

exports.createPromoCode = (promoCodeData) => {
    return new Promise((resolve, reject) => {
        PromoCode.create(promoCodeData).then(promoCode => {
            let uIDs = [];
            let uIDD = [];
            if(promoCodeData.global){
                resolve(promoCode);
            }else{
                promoCodeData.userIds.map(uID => {
                    uIDs.push({
                        userId: uID,
                        promoCodeId: promoCode.dataValues.id
                    });
                    uIDD.push(uID);
                })
                UserPromoCode.bulkCreate(uIDs).then(prRes => {
                    resolve({promoCode:promoCode,uIDs:uIDD});
                }, err => {
                    reject({ error: err });
                }) 
            }
        }, err => {
            reject({ error: err });
        });
    });
};
exports.promoCodeMail = (promoCodeData) => {
    return new Promise((resolve, reject) => { 
        if(promoCodeData.result.uIDs.length > 0){
            sequelize.query('SELECT email from users where id IN (:userIds)',{ replacements: {userIds:  promoCodeData.result.uIDs},type: Sequelize.QueryTypes.SELECT }
            ).then(res => { 
                let emails = _.pluck(res, 'email'); 
                let content = `
                <div style="
                    border-radius: 20px;
                    border: 1px solid #e1e1e1d1;
                    padding: 50px;
                    margin-bottom: 60px;
                ">
                    <p><b>Hi,</p> 
                    <p>Check Your Promo Code</p>
                    <p>${promoCodeData.result.promoCode.dataValues.description}</p>

                    <div style="margin-left:40%;margin-right:40%;background-color:#eee;text-align:center;padding:25px;border-radius:10px;font-size:25px">${promoCodeData.result.promoCode.dataValues.code}</div>

                </div>
                `
                emails.map((email)=>{
                    SendMail.sendEmail(email, "Lavilla Promo Code", content);
                });
                resolve(promoCodeData.result.promoCode);
            }, err => {
                reject({ message: "Promo Code mail send failed..!!!" });
            }); 
        }else{
            sequelize.query('SELECT email from users',{type: Sequelize.QueryTypes.SELECT }
            ).then(res => { 
                let emails = _.pluck(res, 'email');
                let content = `
                <div style="
                    border-radius: 20px;
                    border: 1px solid #e1e1e1d1;
                    padding: 50px;
                    margin-bottom: 60px;
                ">
                    <p><b>Hi,</p> 
                    <p>Check Your Promo Code</p>
                    <p>${promoCodeData.result.promoCode.dataValues.description}</p>

                    <div style="margin-left:40%;margin-right:40%;background-color:#eee;text-align:center;padding:25px;border-radius:10px;font-size:25px">${promoCodeData.result.promoCode.dataValues.code}</div>

                </div>
                `;
                emails.map((email)=>{
                    SendMail.sendEmail(email, "Lavilla Promo Code", content);
                });
                resolve(promoCodeData.result.promoCode);
            }, err => {
                reject({ message: "Promo Code mail send failed..!!!" });
            }); 
        }
    });
};
exports.editPromoCode = (body, id) => {
    return new Promise((resolve, reject) => {
        PromoCode.update(body, {
            where: {
                id: id
            }
        }).then(promoCode => {
            console.log(promoCode);
            if (promoCode.length == 0) {
                reject({ message: "PromoCode update failed..!!!" });
            } else {
                UserPromoCode.destroy({
                    where: {
                        promoCodeId: id
                    }
                }).then(pCode => {
                    let uIDs = [];
                    if(body.global){
                        resolve({ message: "PromoCode updated..!!!" });
                    }else{
                        body.userIds.map(uID => {
                            uIDs.push({
                                userId: uID,
                                promoCodeId: id
                            });
                        })
                        UserPromoCode.bulkCreate(uIDs).then(prRes => {
                            resolve({ message: "PromoCode updated..!!!" });
                        }, err => {
                            reject({ error: err });
                        }) 
                    }
                }, err => {
                    reject({ message: "PromoCode update failed..!!!" });
                });
            }
        }, err => {
            reject({ message: "PromoCode update failed..!!!" });
        });
    });
};
exports.getPromoCode = (promoCodeId) => {
    return new Promise((resolve, reject) => {
        PromoCode.findByPk(promoCodeId, {
            attributes: ['id','code','description','descriptionAr','discountPercent','global','expDate','status','branchId'],
            include:[
                {
                    model: User,
                    attributes:['id','fName','lName']
                }
            ]
        }).then(promoCode => {
            resolve(promoCode);
        }, err => {
            reject({ message: "PromoCode get failed..!!!" });
        });
    });
};
exports.findAllPromoCode = () => {
    return new Promise((resolve, reject) => {
        PromoCode.findAll({
            attributes: ['id','code','description','descriptionAr','discountPercent','global','expDate','branchId','status']
        }).then(promoCodes => {
            resolve(promoCodes);
        }, err => {
            reject({ error: err });
        })
    });
}; 
exports.listAllPromoCode = (body) => {
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
            where: {
                [Op.or]: [
                    {code: { [Op.like]: `%${body.search.value}%` }},
                    {description: { [Op.like]: `%${body.search.value}%` }}
                ]
            }
        }
        PromoCode.paginate(options).then(res => {
            let response = {
                draw: body.draw,
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "PromoCode get failed..!!!" });
        })
    });
};
exports.checkPromoCodeByUser = (userId,code) => { 
    return new Promise((resolve, reject) => { 
        sequelize.query('SELECT promo_codes.* FROM `promo_codes` JOIN `user_promo_codes` on promo_codes.id = user_promo_codes.promoCodeId where promo_codes.code = :code and userId = :userId',{ replacements: { code: code, userId: userId },type: Sequelize.QueryTypes.SELECT }
            ).then(res => { 
                resolve(res[0]);
            }, err => {
                reject({ message: "Invalid Promo Code..!!!" });
            }); 
        
    });
};
exports.deletePromoCode = (promoCodeId) => {
    return new Promise((resolve, reject) => {
        UserPromoCode.destroy({
            where: {
                promoCodeId: promoCodeId
            }
        }).then(res => {
            PromoCode.destroy({
                where: {
                    id: promoCodeId
                },
            }).then(promoCode => {
                console.log(promoCode);
                if (promoCode  == 0) {
                    reject({ message: "PromoCode delete failed..!!!" });
                } else {
                    resolve({ message: "PromoCode deleted..!!!" });
                } 
            }, err => {
                reject({ message: "PromoCode delete failed..!!!" });
            });
        }, err => {
            reject({ message: "PromoCode get failed..!!!" });
        })
       
    });
};
exports.listAllAvailablePromoCode = (userId,branchId) => { 
    return new Promise((resolve, reject) => { 
        sequelize.query('SELECT promo_codes.id,promo_codes.code,promo_codes.description,promo_codes.descriptionAr,promo_codes.discountPercent, promo_codes.expDate,promo_codes.status,promo_codes.global FROM `promo_codes` LEFT OUTER JOIN `user_promo_codes` on promo_codes.id = user_promo_codes.promoCodeId where promo_codes.status = 1 and promo_codes.expDate >= :today and (user_promo_codes.userId = :userId or promo_codes.global = 1) and (promo_codes.branchId is NULL or promo_codes.branchId = :branchId)',{ replacements: { userId: userId,today: moment().format('YYYY-MM-DD'),branchId:branchId},type: Sequelize.QueryTypes.SELECT }
        ).then(res => {
            resolve(res);
        }, err => {
            reject({ message: "Invalid Promo Code..!!!",err:err });
        });
    });
};