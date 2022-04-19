const Sequelize = require('sequelize');
const env = require('../../configs/env');
const fs = require('fs');
const multer = require('multer');
const moment = require('moment');
const _ = require('underscore');
const sequelize = require('../../configs/connection');
const Op = Sequelize.Op;
const ADMIN_USER = require('../../configs/env').permissionLevels.ADMIN;
const Branch = require('../../models/branch')(sequelize, Sequelize);
const Booking = require('../../models/booking')(sequelize, Sequelize);
const BookingRoom = require('../../models/booking-room')(sequelize, Sequelize);
const User = require('../../models/user')(sequelize, Sequelize);
const BranchImages = require('../../models/branch-images')(sequelize, Sequelize);






const Room = require('../../models/room')(sequelize, Sequelize);
const Offer = require('../../models/offer')(sequelize, Sequelize);
const Amenities = require('../../models/amenities')(sequelize, Sequelize);
const Addon = require('../../models/addon')(sequelize, Sequelize);
const RoomAmenities = require('../../models/room-amenities')(sequelize, Sequelize);
const RoomImages = require('../../models/room-images')(sequelize, Sequelize);
const RoomCategory = require('../../models/room-category')(sequelize, Sequelize);
const BedType = require('../../models/bed-type')(sequelize, Sequelize);
const RoomDate = require('../../models/room-date')(sequelize, Sequelize);
const RoomCount = require('../../models/room-count')(sequelize, Sequelize);
const RelatedRooms = require('../../models/related-room')(sequelize, Sequelize);
const BranchNearestCategory = require('../../models/branch-nearest-category')(sequelize, Sequelize);
const BranchNearestItem = require('../../models/branch-nearest-item')(sequelize, Sequelize);
const BranchRating = require('../../models/branch-rating')(sequelize, Sequelize);

Room.belongsTo(RoomCategory, { as: 'roomCategory' });
Room.belongsTo(BedType, { as: 'bedType' });


Room.hasMany(RoomDate, { as: 'roomDate' });


Room.hasMany(RoomCount, { as: 'roomCount' });
// RoomCount.belongsTo(Room, { as: 'room' })


Room.hasMany(BookingRoom, { as: 'bookingRoom' });
Room.hasMany(Offer, { as: 'offer' });
Room.hasMany(RoomImages, { as: 'roomImages' });
Room.hasMany(Addon, { as: 'addons' });
Room.hasMany(RelatedRooms, { as: 'relatedRooms' });
Branch.hasMany(BranchNearestCategory, { as: 'branchNearestCategory' });
BranchNearestCategory.hasMany(BranchNearestItem, { as: 'branchNearestItem' });
Room.belongsToMany(Amenities, { through: RoomAmenities, as: 'roomAmenities', foreignKey: 'roomId' });





Branch.belongsTo(User);
BranchRating.belongsTo(User, { as: 'user' });
BranchRating.belongsTo(Branch, { as: 'branch' });
BranchRating.belongsTo(Booking, { as: 'booking' });
Branch.hasMany(BranchImages, { as: 'branchImages' });
Branch.hasMany(Room, { as: 'room' });
User.hasMany(BranchRating, { as: 'branchRating' });
Branch.hasMany(BranchRating, { as: 'branchRating' });
Branch.sync();
BranchImages.sync();
BranchNearestCategory.sync();
BranchNearestItem.sync();
BranchRating.sync();

exports.uploadBranchImage = multer({
    storage: multer.diskStorage({
        destination: 'uploads/branch/',
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    })
}).array('branchImages', 10);
exports.uploadBranchNearestItemImage = multer({
    storage: multer.diskStorage({
        destination: 'uploads/branch-nearest-item/',
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    })
}).single('branchNearestItemImage');
exports.createBranch = (branchData) => {
    return new Promise((resolve, reject) => {
        console.log(branchData)
        Branch.create(branchData, {
            include: [
                { model: BranchImages, as: 'branchImages' }
            ]
        }).then(branch => {
            resolve(branch);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.editBranch = (body, id) => {
    return new Promise((resolve, reject) => {
        Branch.update(body, {
            where: {
                id: id
            }
        }).then(branch => {
            if (branch.length == 0) {
                reject({ message: "Branch update failed..!!!" });
            } else {
                JSON.parse(body.removedImages).map(imId => {
                    BranchImages.findByPk(imId).then(res => {
                        if (res.dataValues.path) {
                            BranchImages.destroy({
                                where: {
                                    id: imId
                                }
                            })
                            fs.unlinkSync(res.dataValues.path);
                        }
                    })
                })
                resolve({ message: "Branch updated..!!!" });
            }
        }, err => {
            reject({ message: "Branch update failed..!!!" });
        });
    });
};
exports.updateBranchImages = (body) => {
    return new Promise((resolve, reject) => {
        BranchImages.bulkCreate(body.branchImages).then(branchImages => {
            resolve({ message: "Branch updated..!!!" });
        }, err => {
            reject({ error: err });
        });
    });
};
exports.getBranch = (branchId) => {
    return new Promise((resolve, reject) => {
        Branch.findByPk(branchId, {
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', 'status', 'lat', 'lng', 'address', 'addressAr', 'userId'],
            include: [
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')), 'path']],
                    model: BranchImages, as: 'branchImages'
                }
            ]
        }).then(branch => {
            resolve(branch);
        }, err => {
            reject({ message: "Branch update failed..!!!" });
        });
    });
};
exports.getBranchDetails = (branchId, body) => {
    console.log(body.checkIn)
    console.log("branch id", branchId)
    return new Promise((resolve, reject) => {
        Branch.findByPk(branchId, {
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', 'lat', 'lng', 'address', 'addressAr', 'rating'],
            include: [
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('branchImages.path')), 'path']],
                    model: BranchImages, as: 'branchImages'
                }, {
                    attributes: ['id', 'description', 'descriptionAr', 'adultCount', 'childCount', 'count'],
                    model: Room, as: 'room',
                    include: [
                        {
                            attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('room->roomImages.path')), 'path']],
                            model: RoomImages, as: 'roomImages'
                        },
                        {
                            attributes: ['id', 'offerPercent'],
                            model: Offer, as: 'offer',
                            where: {
                                status: 1,
                            },
                            required: false
                        },
                        {
                            attributes: ['id', 'name', 'nameAr'],
                            model: RoomCategory, as: 'roomCategory'
                        },
                        {
                            attributes: ['id', 'name', 'nameAr', 'iconName'],
                            model: Amenities, as: 'roomAmenities'
                        },
                        {
                            attributes: ['id', 'name', 'nameAr'],
                            model: BedType, as: 'bedType'
                        },
                        {
                            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', 'price', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('room->addons.image')), 'image'], 'multiple'],
                            model: Addon, as: 'addons'
                        },
                        {
                            attributes: ['date', 'BBAOne', 'BBATwo', 'ROAOne', 'ROATwo', 'bookedCount'],
                            model: RoomDate, as: 'roomDate',
                            where: {
                                date: {
                                    [Op.between]: [body.checkIn, moment(body.checkOut, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD')]
                                }
                            }
                        },
                        {
                            attributes: ['date', 'roomId', 'count',],
                            model: RoomCount, as: 'roomCount',
                            where: {
                                date: {
                                    [Op.between]: [body.checkIn, moment(body.checkOut, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD')]
                                }
                            },
                            required: false
                        },
                        {
                            model: RelatedRooms, as: 'relatedRooms'
                        },
                        {
                            attributes: ['createdAt'],
                            model: BookingRoom, as: 'bookingRoom',
                            order: [['id', 'DESC']],
                            limit: 1
                        }
                    ]
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: BranchNearestCategory, as: 'branchNearestCategory',
                    include: [
                        {
                            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', 'link', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('branchNearestCategory->branchNearestItem.image')), 'image']],
                            model: BranchNearestItem, as: 'branchNearestItem'
                        }
                    ]
                }
            ]
        }).then(branch => {

            branch = branch.toJSON();
            let totalCount = 0;
            // console.log("---------------------------------------------------------branch", branch)


            //to accomodate the dynamic room count - codedady start
            for (var x = 0; x < branch.room.length; x++) {

                if (branch.room[x].roomCount.length > 0) {

                    let minDateCount = []
                    for (var k = 0; k < branch.room[x].roomCount.length; k++) {


                        if (branch.room[x].roomDate.find(item => item.date == branch.room[x].roomCount[k].date)) {
                            // console.log("booked count ", branch.room[x].roomCount[k].count, branch.room[x].roomDate.find(item => item.date == branch.room[x].roomCount[k].date), branch.room[x].roomCount[k].count - branch.room[x].roomDate.find(item => item.date == branch.room[x].roomCount[k].date).bookedCount)
                            minDateCount.push({ maxCount: branch.room[x].roomCount[k].count - branch.room[x].roomDate.find(item => item.date == branch.room[x].roomCount[k].date).bookedCount, count: branch.room[x].roomCount[k].count })
                        }
                    }
                    // minDateCount.push({ maxCount: branch.room[x].maxCount, count: branch.room[x].count })
                    // console.log("min date", minDateCount)
                    // console.log("max count", Math.min.apply(Math, minDateCount.map(function (o) { return o.maxCount; })))
                    // console.log(Math.min(...minDateCount))
                    // console.log("min array", minDateCount)
                    // console.log(branch.room[x].roomCount.length, moment(body.checkIn).diff(moment(body.checkOut), 'days'))
                    // if (branch.room[x].roomCount.length < moment(body.checkOut).diff(moment(body.checkIn), 'days')) {
                    //     console.log("ok---------------------------------------------")
                    //     minDateCount.push({maxCount: branch.room[x].maxCount, count: branch.room[x].maxCount})
                    // }
                    console.log("min array", minDateCount)

                    branch.room[x].countWithDate = Math.min.apply(Math, minDateCount.map(function (o) { return o.maxCount; }))
                } else {
                    branch.room[x].countWithDate = "NIL"
                    // console.log(branch.room[x].count)
                }
            }
            //codedady end

            branch.room.map((rm, i) => {
                let bookedCount = _.max(_.pluck(rm.roomDate, 'bookedCount'));

                
                // totalCount += rm.count  - bookedCount;

                branch.room[i].maxCount = rm.count - bookedCount;
                // //codedady start
                var startDate = moment(body.checkIn)
                var endDate = moment(body.checkOut)
                console.log("difference", rm.roomDate.length, endDate.diff(startDate, 'days'))

                //set count with date to max count if it is greater
                if (rm.roomCount.length < endDate.diff(startDate, 'days')) { 
                    console.log("if set count with date to max count if it is greater", branch.room[i].maxCount)
                    if(branch.room[i].countWithDate > branch.room[i].maxCount){
                        branch.room[i].countWithDate = branch.room[i].maxCount;
                    } 
                }

                //remove search with no price added dates in between
                if (rm.roomDate.length < endDate.diff(startDate, 'days')) {
                    // console.log(rm.roomDate.length, endDate.diff(startDate, 'days'))
                    // var flag = 0
                    // for(var z=0; z< rm.roomDate.length; z++){
                    //     if(rm.roomDate[z].ROAOne != 0){
                    //         flag=flag+1
                    //     } 
                    // }
                    console.log("1")
                    branch.room[i].maxCount = 0;
                    branch.room[i].countWithDate = 0;
                }

                for(var x=0; x< rm.roomDate.length; x++) {
                    if((rm.roomDate[x].BBAOne +rm.roomDate[x].BBATwo + rm.roomDate[x].ROAOne + rm.roomDate[x].ROATwo) <= 0) {
                        console.log("2")
                        branch.room[i].maxCount = 0;
                        branch.room[i].countWithDate = 0;
                    }
                }


                if (branch.room[i].countWithDate == "NIL") {
                    console.log("3")
                    branch.room[i].countWithDate = branch.room[i].maxCount;
                }
                // console.log(branch.room[i].countWithDate, bookedCount)
                totalCount += branch.room[i].countWithDate ;


                // //codedady end

                branch.room[i].BBAOne = _.map(rm.roomDate, function (roomDate) { return roomDate.BBAOne; }).reduce((s, f) => {
                    return s + f;
                }, 0);
                branch.room[i].BBATwo = _.map(rm.roomDate, function (roomDate) { return roomDate.BBATwo; }).reduce((s, f) => {
                    return s + f;
                }, 0);
                branch.room[i].ROAOne = _.map(rm.roomDate, function (roomDate) { return roomDate.ROAOne; }).reduce((s, f) => {
                    return s + f;
                }, 0);
                branch.room[i].ROATwo = _.map(rm.roomDate, function (roomDate) { return roomDate.ROATwo; }).reduce((s, f) => {
                    return s + f;
                }, 0);
            })
            // console.log(totalCount, body.roomCount);

           
            if (totalCount >= body.roomCount) {
                resolve(branch);
            } else {
                branch.room = [];
                resolve(branch);
            }

        }, err => {
            reject({ message: "Branch update failed..!!!", err: err });
        });
    });
};
exports.findAllBranch = () => {
    return new Promise((resolve, reject) => {
        Branch.findAll({
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', 'status', 'lat', 'lng', 'address', 'addressAr'],
            include: [
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')), 'path']],
                    model: BranchImages, as: 'branchImages'
                }
            ]
        }).then(branches => {
            resolve(branches);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.findAllActiveBranch = () => {
    return new Promise((resolve, reject) => {
        Branch.findAll({
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr'],
            where: {
                status: 1
            },
            include: [
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')), 'path']],
                    model: BranchImages, as: 'branchImages'
                }
            ]
        }).then(branches => {
            resolve(branches);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.listAllBranch = (body) => {
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
                    { name: { [Op.like]: `%${body.search.value}%` } },
                    { address: { [Op.like]: `%${body.search.value}%` } }
                ]
            },
            include: [
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')), 'path']],
                    model: BranchImages, as: 'branchImages'
                }
            ]
        }
        Branch.paginate(options).then(res => {
            let response = {
                draw: body.draw,
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "Branch get failed..!!!" });
        })
    });
};
exports.listAllBranchFeedBacks = (body) => {
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
                    { message: { [Op.like]: `%${body.search.value}%` } },
                    { rating: { [Op.like]: `%${body.search.value}%` } }
                ],
                branchId: body.branchId
            },
            include: [
                {
                    attributes: ['id', 'fName', 'lName'],
                    model: User, as: 'user'
                },
                {
                    attributes: ['id'],
                    model: Booking, as: 'booking'
                }
            ]
        }
        BranchRating.paginate(options).then(res => {
            let response = {
                draw: body.draw,
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "Branch Rating get failed..!!!" });
        })
    });
};
exports.listAllActiveBranch = () => {
    return new Promise((resolve, reject) => {
        Branch.findAll({
            where: {
                status: 1
            },
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr'],
            include: [
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')), 'path']],
                    model: BranchImages, as: 'branchImages'
                }
            ]
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ message: "Branch get failed..!!!" });
        })
    });
};
exports.checkRatingAlreadyExist = (body) => {
    return new Promise((resolve, reject) => {
        BranchRating.findOne({
            where: {
                userId: body.userId,
                branchId: body.branchId
            }
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ message: "Branch Rating add failed..!!!" });
        })
    });
};
exports.updateBranchRating = (body) => {
    return new Promise((resolve, reject) => {
        if (body.id == null) {
            BranchRating.create(body).then(res => {
                resolve(res);
            }, err => {
                reject({ message: "Branch Rating add failed..!!!" });
            })
        } else {
            BranchRating.update(body, {
                where: {
                    id: body.id
                }
            }).then(res => {
                BranchRating.findByPk(body.id).then(branchRating => {
                    resolve(branchRating);
                }, err => {
                    reject({ error: err });
                })
            }, err => {
                reject({ message: "Branch Rating add failed..!!!" });
            })
        }
    });
};
exports.updateBranch = (body) => {
    return new Promise((resolve, reject) => {
        BranchRating.findAll({
            where: {
                branchId: body.branchId
            }
        }).then(res => {
            let rating = (_.map(res, function (branchRating) { return branchRating.dataValues.rating; }).reduce((s, f) => {
                return s + f;
            }, 0)) / res.length;
            Branch.update({ rating: rating }, {
                where: {
                    id: body.branchId
                }
            }).then(branch => {
                resolve(body.data);
            }, err => {
                reject({ error: err });
            })
        }, err => {
            reject({ message: "Branch Rating add failed..!!!" });
        })
    });
};
exports.checkTheUserIsAdmin = (selectedUserId) => {
    return new Promise((resolve, reject) => {
        console.log(selectedUserId);
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
exports.deleteBranch = (branchId) => {
    return new Promise((resolve, reject) => {
        Branch.destroy({
            where: {
                id: branchId
            },
        }).then(branch => {
            console.log(branch);
            if (branch == 0) {
                reject({ message: "Branch delete failed..!!!" });
            } else {
                resolve({ message: "Branch deleted..!!!" });
            }
        }, err => {
            reject({ message: "Branch delete failed..!!!" });
        });
    });
};
















exports.addBranchNearestCategory = (data) => {
    return new Promise((resolve, reject) => {
        BranchNearestCategory.create(data).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.listBranchNearestCategory = (id) => {
    return new Promise((resolve, reject) => {
        BranchNearestCategory.findAll({
            where: {
                branchId: id
            },
            attributes: ['id', 'name', 'nameAr'],
            include: [
                {
                    attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')), 'image'], 'link'],
                    model: BranchNearestItem, as: 'branchNearestItem'
                }
            ]
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.deleteBranchNearestCategory = (id) => {
    return new Promise((resolve, reject) => {
        BranchNearestCategory.destroy({
            where: {
                id: id
            }
        }).then(res => {
            if (res == 0) {
                reject({ message: "Branch Nearest Category delete failed..!!!" });
            } else {
                resolve({ message: "Branch Nearest Category deleted..!!!" });
            }
        }, err => {
            reject({ error: err });
        });
    });
};
exports.addBranchNearestItem = (data) => {
    return new Promise((resolve, reject) => {
        BranchNearestItem.create(data).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.deleteBranchNearestItem = (id) => {
    return new Promise((resolve, reject) => {
        BranchNearestItem.findByPk(id).then(res => {
            BranchNearestItem.destroy({
                where: {
                    id: id
                }
            }).then(res => {
                if (res == 0) {
                    reject({ message: "Branch Nearest Item delete failed..!!!" });
                    
                } else {
                    resolve({ message: "Branch Nearest Item deleted..!!!" });
                }
            }, err => {
                reject({ error: err });
            });
            fs.unlinkSync(res.dataValues.image);
        }, err => {
            reject({ error: err });
        });
    });
};