const Sequelize = require('sequelize');
const multer = require('multer');
const _  = require('underscore');
const Op = Sequelize.Op;
const fs = require('fs');
const env = require('../../configs/env');
const sequelize = require('../../configs/connection');
const Property = require('../../models/property')(sequelize, Sequelize);
const PropertyType = require('../../models/property-type')(sequelize, Sequelize);
const PropertyPurpose = require('../../models/property-purpose')(sequelize, Sequelize);
const PropertyLocation = require('../../models/property-location')(sequelize, Sequelize);
const PropertyLookingFor = require('../../models/property-looking-for')(sequelize, Sequelize);
const PropertyAmenities = require('../../models/property-amenities')(sequelize, Sequelize);
const PropertyImages = require('../../models/property-images')(sequelize, Sequelize);
const Amenities = require('../../models/amenities')(sequelize, Sequelize);
Property.belongsTo(PropertyType, { as: 'propertyType' });
Property.belongsTo(PropertyPurpose, { as: 'propertyPurpose' });
Property.belongsTo(PropertyLocation, { as: 'propertyLocation' });
Property.belongsTo(PropertyLookingFor, { as: 'propertyLookingFor' });
Property.hasMany(PropertyImages, { as: 'propertyImages' });
Property.belongsToMany(Amenities, { through: PropertyAmenities, as: 'propertyAmenities', foreignKey: 'propertyId' });
Property.sync();
PropertyAmenities.sync();
PropertyImages.sync();

exports.uploadPropertyImage = multer({
    storage: multer.diskStorage({
        destination: 'uploads/property/',
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    })
}).array('propertyImages', 10);
exports.createProperty = (propertyData) => {
    return new Promise((resolve, reject) => {
        Property.create(propertyData, {
            include: [
                { model: PropertyImages, as: 'propertyImages' }
            ]
        }).then(property => {
            let amIDs = [];
            console.log(propertyData);
            JSON.parse(propertyData.amenityId).map(amID => {
                amIDs.push({
                    amenityId: amID,
                    propertyId: property.dataValues.id
                });
            })
            PropertyAmenities.bulkCreate(amIDs).then(prRes => {
                resolve(property);
            }, err => {
                reject({ error: err });
            })
        }, err => {
            reject({ error: err });
        });
    });
};
exports.editProperty = (body, id) => {
    return new Promise((resolve, reject) => {
        Property.update(body, {
            where: {
                id: id
            },
            include: [
                { model: PropertyImages, as: 'propertyImages' }
            ]
        }).then(property => {
            if (property.length == 0) {
                reject({ message: "Property update failed..!!!" });
            } else {
                JSON.parse(body.removedImages).map(imId => {
                    PropertyImages.findByPk(imId).then(res => {
                        if (res.dataValues.path) {
                            PropertyImages.destroy({
                                where: {
                                    id: imId
                                }
                            })
                            fs.unlinkSync(res.dataValues.path);
                        }
                    })
                })

                let amIDs = [];
                JSON.parse(body.amenityId).map(amID => {
                    amIDs.push({
                        amenityId: amID,
                        propertyId: id
                    });
                })

                PropertyAmenities.destroy({
                    where: {
                        propertyId: id
                    },
                }).then(propertyAmenities => {
                    if (amIDs.length > 0) {
                        PropertyAmenities.bulkCreate(amIDs).then(pamRes => {
                            resolve({ message: "Property updated..!!!" });
                        }, err => {
                            reject({ error: err });
                        })
                    } else {
                        resolve({ message: "Property updated..!!!" });
                    }
                }, err => {
                    reject({ error: err });
                })

            }
        }, err => {
            reject({ message: "Property update failed..!!!" });
        });
    });
};
exports.updatePropertyImages = (body) => {
    return new Promise((resolve, reject) => {
        PropertyImages.bulkCreate(body.propertyImages).then(propertyImages => {
            resolve({ message: "Property updated..!!!" });
        }, err => {
            reject({ error: err });
        });
    });
};
exports.getProperty = (propertyId) => {
    return new Promise((resolve, reject) => {
        Property.findByPk(propertyId, {
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', 'bedroomNo', 'bathroomNo', 'plotArea', 'price', 'carParking', 'furnished', 'phone', 'email', 'address', 'addressAr', 'lat', 'lng'],
            include: [
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: PropertyLocation, as: 'propertyLocation'
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: PropertyPurpose, as: 'propertyPurpose'
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: PropertyType, as: 'propertyType'
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: PropertyLookingFor, as: 'propertyLookingFor'
                },
                {
                    attributes: ['id', 'name', 'nameAr', 'iconName'],
                    model: Amenities, as: 'propertyAmenities'
                },
                {
                    attributes: ['id',[Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')),'path']],
                    model: PropertyImages, as: 'propertyImages'
                }
            ]
        }).then(property => {
            Property.findAll({
                where:{
                    propertyLocationId:property.dataValues.propertyLocation.id,
                    id:{
                        [Op.ne]:property.dataValues.id
                    }
                },
                attributes: ['id', 'name', 'nameAr', 'price', 'carParking', 'furnished', 'phone', 'email' ],
                include:[
                    {
                        attributes: ['id',[Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')),'path']],
                        model: PropertyImages, as: 'propertyImages'
                    },
                    {
                        attributes: ['id', 'name', 'nameAr'],
                        model: PropertyPurpose, as: 'propertyPurpose'
                    },
                    {
                        attributes: ['id', 'name', 'nameAr'],
                        model: PropertyType, as: 'propertyType'
                    },
                ]
            }).then(property1 => {
                let p = property.dataValues;
                p['similarProperties'] = _.pluck(property1, 'dataValues');
                resolve(p);
            }, err => {
                reject({ message: "Property update failed..!!!", err: err });
            });
        }, err => {
            reject({ message: "Property update failed..!!!", err: err });
        });
    });
};
exports.findAllProperty = (body) => {
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
        Property.paginate(options).then(res => {
            let response = {
                draw: body.draw,
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "Property get failed..!!!" });
        })
    });
};
exports.listAllProperty = () => {
    return new Promise((resolve, reject) => {
        Property.findAll({
            attributes: ['id', 'name', 'nameAr', 'featured']
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ message: "Property get failed..!!!" });
        })
    });
};
exports.getAllProperty = () => {
    return new Promise((resolve, reject) => {
        Property.findAll({
            attributes: ['id', 'name', 'nameAr']
        }).then(property => {
            resolve(property);
        }, err => {
            reject({ message: "Property update failed..!!!" });
        });
    });
};
exports.deleteProperty = (propertyId) => {
    return new Promise((resolve, reject) => {
        PropertyImages.findAll({
            where: {
                propertyId: propertyId
            }

        }).then(res => {
            PropertyImages.destroy({
                where: {
                    propertyId: propertyId
                }

            })
            res.map(r => {
                fs.unlinkSync(r.dataValues.path);
            })
            
            Property.destroy({
                where: {
                    id: propertyId
                },
            }).then(property => {
                console.log(property);
                if (property == 0) {
                    reject({ message: "Property delete failed..!!!" });
                } else {
                    resolve({ message: "Property deleted..!!!" });
                }
            }, err => {
                reject({ message: "Property delete failed..!!!" });
            });
        }, err => {
            reject({ error: err });
        });
    });
};
exports.searchProperty = (body) => {
    return new Promise((resolve, reject) => {
        let v = {};
        let where = {};
        if (body.propertyPurposeId) {
            Object.assign(where, {
                propertyPurposeId: body.propertyPurposeId
            });
        }
        if (body.propertyLookingForId) {
            Object.assign(where, {
                propertyLookingForId: body.propertyLookingForId
            });
        }
        if (body.propertyLocationId) {
            Object.assign(where, {
                propertyLocationId: body.propertyLocationId
            });
        }
        if (body.propertyTypeId) {
            Object.assign(where, {
                propertyTypeId: body.propertyTypeId
            });
        }
        if (body.priceFrom && body.priceTo) {
            Object.assign(where, {
                price: {
                    [Op.gte]: body.priceFrom,
                    [Op.lte]: body.priceTo
                }
            });
        }

        console.log(where);
        const options = {
            page: body.page,
            paginate: 10,
            order: [[body.sortBy, body.sortByType]],
            where: where,
            attributes: ['id', 'name', 'nameAr', 'bedroomNo', 'bathroomNo', 'price', 'carParking', 'phone', 'email'],
            include: [
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: PropertyLocation, as: 'propertyLocation'
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: PropertyPurpose, as: 'propertyPurpose'
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: PropertyType, as: 'propertyType'
                },
                {
                    attributes: ['id',[Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')),'path']],
                    model: PropertyImages, as: 'propertyImages'
                }
            ]
        }
        Property.paginate(options).then(res => {
            let response = {
                recordsTotal: res.total,
                data: res.docs
            }
            resolve(response);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.listAllPropertyType = () => {
    return new Promise((resolve, reject) => {
        PropertyType.findAll({
            attributes: ['id', 'name', 'nameAr']
        }).then(property => {
            resolve(property);
        }, err => {
            reject({ message: "Property Type fetching failed..!!!" });
        });
    });
};
exports.listAllPropertyLookingFor = () => {
    return new Promise((resolve, reject) => {
        PropertyLookingFor.findAll({
            attributes: ['id', 'name', 'nameAr']
        }).then(property => {
            resolve(property);
        }, err => {
            reject({ message: "Property LookingFor fetching failed..!!!" });
        });
    });
};
exports.listAllPropertyPurpose = () => {
    return new Promise((resolve, reject) => {
        PropertyPurpose.findAll({
            attributes: ['id', 'name', 'nameAr']
        }).then(property => {
            resolve(property);
        }, err => {
            reject({ message: "Property Purpose fetching failed..!!!" });
        });
    });
};
exports.listAllPropertyLocation = () => {
    return new Promise((resolve, reject) => {
        PropertyLocation.findAll({
            attributes: ['id', 'name', 'nameAr']
        }).then(property => {
            resolve(property);
        }, err => {
            reject({ message: "Property Location fetching failed..!!!" });
        });
    });
};
exports.getFeaturedProperty = () => {
    return new Promise((resolve, reject) => {
        Property.findAll({
            where: {
                featured: 1
            },
            attributes: ['id', 'name', 'nameAr', 'bedroomNo', 'bathroomNo', 'price', 'carParking', 'phone', 'email'],
            include: [
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: PropertyLocation, as: 'propertyLocation'
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: PropertyPurpose, as: 'propertyPurpose'
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: PropertyType, as: 'propertyType'
                },
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')),'path']],
                    model: PropertyImages, as: 'propertyImages'
                }
            ]
        }).then(property => {
            resolve(property);
        }, err => {
            reject({ message: "Property Location fetching failed..!!!" });
        });
    });
};
exports.setPropertyFeatured = (id) => {
    return new Promise((resolve, reject) => {
        Property.update({
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
exports.setPropertyUnfeatured = (id) => {
    return new Promise((resolve, reject) => {
        Property.update({
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