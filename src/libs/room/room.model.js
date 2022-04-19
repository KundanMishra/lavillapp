const Sequelize = require('sequelize');
const multer = require('multer');
const moment = require('moment');
const _ = require('underscore');
const Op = Sequelize.Op;
const env = require('../../configs/env');
const sequelize = require('../../configs/connection');
const { QueryTypes } = require('sequelize');
const ADMIN_USER = require('../../configs/env').permissionLevels.ADMIN;
const Room = require('../../models/room')(sequelize, Sequelize);
const Amenities = require('../../models/amenities')(sequelize, Sequelize);
const Addon = require('../../models/addon')(sequelize, Sequelize);
const RoomAmenities = require('../../models/room-amenities')(sequelize, Sequelize);
const RoomImages = require('../../models/room-images')(sequelize, Sequelize);
const Branch = require('../../models/branch')(sequelize, Sequelize);
const RoomCategory = require('../../models/room-category')(sequelize, Sequelize);
const BedType = require('../../models/bed-type')(sequelize, Sequelize);
const RoomDate = require('../../models/room-date')(sequelize, Sequelize);
const RoomCount = require('../../models/room-count')(sequelize, Sequelize);
const Booking = require('../../models/booking')(sequelize, Sequelize);
const Country = require('../../models/country')(sequelize, Sequelize);
const RelatedRooms = require('../../models/related-room')(sequelize, Sequelize);
const Offer = require('../../models/offer')(sequelize, Sequelize);
const fs = require('fs');
const BookingRoom = require('../../models/booking-room')(sequelize, Sequelize);

Room.belongsTo(Branch, { as: 'branch' });
Room.belongsTo(RoomCategory, { as: 'roomCategory' });
Room.belongsTo(BedType, { as: 'bedType' });

Room.hasMany(RoomDate, { as: 'roomDate' });
RoomDate.belongsTo(Room, { as: 'room' });

Room.hasMany(RoomCount, { as: 'roomCount' });
RoomCount.belongsTo(Room, { as: 'room' })

Room.hasMany(RoomImages, { as: 'roomImages' });
Room.hasMany(Addon, { as: 'addons' });
Room.hasMany(RelatedRooms, { as: 'relatedRooms' });
Room.hasMany(BookingRoom, { as: 'bookingRoom' });
Room.belongsToMany(Amenities, { through: RoomAmenities, as: 'roomAmenities', foreignKey: 'roomId' });
Room.hasMany(Offer, { as: 'offer' });




const BookingUser = require('../../models/booking-user')(sequelize, Sequelize);
const BookingStatus = require('../../models/booking-status')(sequelize, Sequelize);
const BookingLoyalty = require('../../models/booking-loyalty')(sequelize, Sequelize);
const BookingPromoCode = require('../../models/booking-promo-code')(sequelize, Sequelize);
const BookingCard = require('../../models/booking-card')(sequelize, Sequelize);
const BookingCancellation = require('../../models/booking-cancellation')(sequelize, Sequelize);
const BookingRoomDate = require('../../models/booking-room-date')(sequelize, Sequelize);
const UserLoyalty = require('../../models/user-loyalty')(sequelize, Sequelize);
Booking.hasMany(BookingRoom, { as: 'bookingRoom' });

Booking.belongsTo(BookingUser, { as: 'bookingUser' });
Booking.belongsTo(BookingStatus, { as: 'bookingStatus' });
Booking.belongsTo(BookingLoyalty, { as: 'bookingLoyalty' });

Booking.belongsTo(BookingPromoCode, { as: 'bookingPromoCode' });
Booking.belongsTo(BookingCard, { as: 'bookingCard' });
Booking.hasOne(BookingCancellation);
Booking.belongsTo(Branch, { as: 'branch' });

Booking.hasMany(BookingRoomDate, { as: 'bookingRoomDate' });
Booking.hasMany(UserLoyalty, { as: 'bookingUserLoyalty' });
BookingRoomDate.belongsTo(RoomDate, { as: 'roomDate' });

Room.sync();
Addon.sync();
RoomAmenities.sync();
RoomImages.sync();
RoomDate.sync();
RoomCount.sync();
RelatedRooms.sync();

exports.uploadRoomImage = multer({
    storage: multer.diskStorage({
        destination: 'uploads/room/',
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    })
}).array('roomImages', 10);
exports.uploadRoomAddonImage = multer({
    storage: multer.diskStorage({
        destination: 'uploads/room-addon/',
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    })
}).single('roomAddonImages');
exports.createRoom = (roomData) => {
    return new Promise((resolve, reject) => {
        console.log(roomData);
        Room.create(roomData, {
            include: [
                { model: RoomImages, as: 'roomImages' }
            ]
        }).then(room => {
            let amIDs = [];
            JSON.parse(roomData.amenityId).map(amID => {
                amIDs.push({
                    amenityId: amID,
                    roomId: room.dataValues.id
                });
            })
            RoomAmenities.bulkCreate(amIDs).then(rmRes => {
                resolve(room);
            }, err => {
                reject({ error: err });
            })

        }, err => {
            reject({ error: err });
        });
    });
};
exports.editRoom = (body, id) => {
    return new Promise((resolve, reject) => {
        Room.update(body, {
            where: {
                id: id
            }
        }).then(room => {
            if (room.length == 0) {
                reject({ message: "Room update failed..!!!" });
            } else {
                JSON.parse(body.removedImages).map(imId => {

                    RoomImages.findByPk(imId).then(res => {
                        if (res.dataValues.path) {
                            RoomImages.destroy({
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
                        roomId: id
                    });
                })

                RoomAmenities.destroy({
                    where: {
                        roomId: id
                    },
                }).then(roomAmenities => {

                    if (amIDs.length > 0) {
                        RoomAmenities.bulkCreate(amIDs).then(ramRes => {
                            resolve({ message: "Room updated..!!!" });
                        }, err => {
                            reject({ error: err });
                        })
                    } else {
                        resolve({ message: "Room updated..!!!" });
                    }
                }, err => {
                    reject({ error: err });
                })

            }
        }, err => {
            reject({ message: "Room update failed..!!!", err: err });
        });
    });
};
exports.updateRoomImages = (body) => {
    return new Promise((resolve, reject) => {
        RoomImages.bulkCreate(body.roomImages).then(roomImages => {
            resolve({ message: "Room updated..!!!" });
        }, err => {
            reject({ error: err });
        });
    });
};
exports.createRoomAddon = (body) => {
    return new Promise((resolve, reject) => {
        Addon.create(body).then(addon => {
            resolve(addon);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.getRoom = (roomId) => {
    return new Promise((resolve, reject) => {
        Room.findByPk(roomId, {
            attributes: ['id', 'description', 'descriptionAr', 'adultCount', 'childCount', 'BBAOnePercent', 'BBATwoPercent', 'ROATwoPercent', 'count'],
            include: [
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')), 'path']],
                    model: RoomImages, as: 'roomImages'
                }, {
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
                    attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', 'price', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('addons.image')), 'image'], 'multiple'],
                    model: Addon, as: 'addons'
                },
                {
                    attributes: ['id', 'name', 'nameAr', 'address', 'addressAr', 'lat', 'lng'],
                    model: Branch, as: 'branch'
                },
                {
                    model: RelatedRooms, as: 'relatedRooms'
                }
            ]
        }).then(room => {

            resolve(room);
        }, err => {
            reject({ message: "Room get failed..!!!", err: err });
        });
    });
};

exports.searchRoomAvailability = (body, edit) => {
    return new Promise((resolve, reject) => {
        let where = {};
        if (body.branch) {
            where.branchId = body.branch;
        }
        Room.findAll({
            attributes: ['id', 'description', 'descriptionAr', 'adultCount', 'childCount', 'count'],
            where: where,
            include: [
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('roomImages.path')), 'path']],
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
                    attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', 'price', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('addons.image')), 'image'], 'multiple'],
                    model: Addon, as: 'addons'
                },
                {
                    attributes: ['id', 'date', 'BBAOne', 'BBATwo', 'ROAOne', 'ROATwo', 'bookedCount'],
                    model: RoomDate, as: 'roomDate',
                    where: {
                        date: {
                            [Op.between]: [body.checkIn, moment(body.checkOut, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD')]
                        }
                    }
                },
                {
                    attributes: ['createdAt'],
                    model: BookingRoom, as: 'bookingRoom',
                    order: [['id', 'DESC']],
                    limit: 1
                }
            ]
        }).then(room => {
            // let totalCount = 0;
            // room.map((rm,i)=>{
            //     room[i] = rm.toJSON();
            //     let bookedCount =  _.max(_.pluck(rm.roomDate, 'bookedCount'));
            //     totalCount += rm.count - bookedCount; 
            //     room[i].maxCount = rm.count - bookedCount;
            //     room[i].BBAOne = _.map(rm.roomDate, function(roomDate) { return roomDate.BBAOne; }).reduce((s, f) => {
            //         return s + f;
            //     }, 0);
            //     room[i].BBATwo = _.map(rm.roomDate, function(roomDate) { return roomDate.BBATwo; }).reduce((s, f) => {
            //         return s + f;
            //     }, 0);
            //     room[i].ROAOne = _.map(rm.roomDate, function(roomDate) { return roomDate.ROAOne; }).reduce((s, f) => {
            //         return s + f;
            //     }, 0);
            //     room[i].ROATwo = _.map(rm.roomDate, function(roomDate) { return roomDate.ROATwo; }).reduce((s, f) => {
            //         return s + f;
            //     }, 0);

            // });
            // console.log(totalCount,body.roomCount);
            // if(totalCount >= body.roomCount){
            //     resolve(room);
            // }else{
            //     resolve([]);
            // }

            if (edit) {
                Booking.findByPk(body.bookingId, {
                    include: [
                        { model: BookingRoomDate, as: "bookingRoomDate" }
                    ]
                }).then(booking => {
                    let totalCount = 0;
                    room.map((rm, i) => {
                        room[i] = rm.toJSON();
                        booking.dataValues.bookingRoomDate.map((d, v) => {
                            if (_.findIndex(room[i].roomDate, { id: d.dataValues.roomDateId }) >= 0) {
                                room[i].roomDate[_.findIndex(room[i].roomDate, { id: d.dataValues.roomDateId })]['bookedCount'] -= d.dataValues.bookedCount;
                            }
                        })
                        let bookedCount = _.max(_.pluck(room[i].roomDate, 'bookedCount'));
                        totalCount += room[i].count - bookedCount;
                        room[i].maxCount = room[i].count - bookedCount;
                        room[i].BBAOne = _.map(room[i].roomDate, function (roomDate) { return roomDate.BBAOne; }).reduce((s, f) => {
                            return s + f;
                        }, 0);
                        room[i].BBATwo = _.map(room[i].roomDate, function (roomDate) { return roomDate.BBATwo; }).reduce((s, f) => {
                            return s + f;
                        }, 0);
                        room[i].ROAOne = _.map(room[i].roomDate, function (roomDate) { return roomDate.ROAOne; }).reduce((s, f) => {
                            return s + f;
                        }, 0);
                        room[i].ROATwo = _.map(room[i].roomDate, function (roomDate) { return roomDate.ROATwo; }).reduce((s, f) => {
                            return s + f;
                        }, 0);
                    })
                    if (totalCount >= body.roomCount) {
                        resolve(room);
                    } else {
                        room = [];
                        resolve(room);
                    }
                }, err => {
                    reject({ error: err });
                })
            } else {
                let totalCount = 0;
                room.map((rm, i) => {
                    room[i] = rm.toJSON();
                    let bookedCount = _.max(_.pluck(rm.roomDate, 'bookedCount'));
                    totalCount += rm.count - bookedCount;
                    room[i].maxCount = rm.count - bookedCount;
                    room[i].BBAOne = _.map(rm.roomDate, function (roomDate) { return roomDate.BBAOne; }).reduce((s, f) => {
                        return s + f;
                    }, 0);
                    room[i].BBATwo = _.map(rm.roomDate, function (roomDate) { return roomDate.BBATwo; }).reduce((s, f) => {
                        return s + f;
                    }, 0);
                    room[i].ROAOne = _.map(rm.roomDate, function (roomDate) { return roomDate.ROAOne; }).reduce((s, f) => {
                        return s + f;
                    }, 0);
                    room[i].ROATwo = _.map(rm.roomDate, function (roomDate) { return roomDate.ROATwo; }).reduce((s, f) => {
                        return s + f;
                    }, 0);
                })
                console.log(totalCount, body.roomCount);
                if (totalCount >= body.roomCount) {
                    resolve(room);
                } else {
                    room = [];
                    resolve(room);
                }
            }
        }, err => {
            reject({ error: err });
        })
    });
};
exports.findAllRoom = () => {
    return new Promise((resolve, reject) => {
        Room.findAll({
            attributes: ['id', 'description', 'descriptionAr', 'adultCount', 'childCount', 'count'],
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
        }).then(room => {
            resolve(room);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.findAllRoomBedType = () => {
    return new Promise((resolve, reject) => {
        BedType.findAll({
            attributes: ['id', 'name', 'nameAr']
        }).then(room => {
            resolve(room);
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
exports.deleteRoom = (roomId) => {
    return new Promise((resolve, reject) => {
        RoomImages.findAll({
            where: {
                roomId: roomId
            }

        }).then(res => {
            
            Room.destroy({
                where: {
                    id: roomId
                },
            }).then(room => {
                console.log(room);
                if (room == 0) {
                    reject({ message: "Room delete failed..!!!" });
                } else {
                    resolve({ message: "Room deleted..!!!" });
                }
            }, err => {
                reject({ message: "Room delete failed..!!!" });
            });
            res.map(r => {
                fs.unlinkSync(r.dataValues.path);
            })
        }, err => {
            reject({ error: err });
        });
    });
};
exports.findAllRoomAddon = (roomId) => {
    return new Promise((resolve, reject) => {
        Addon.findAll({
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', 'multiple', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')), 'image'], 'price'],
            where: {
                roomId: roomId
            }
        }).then(room => {
            resolve(room);
        }, err => {
            reject({ error: err });
        })
    });
};
exports.listAllRoom = (body) => {
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
            where: {
                [Op.or]: [
                    { description: { [Op.like]: `%${body.search.value}%` } }
                ]
            }
        }
        Room.paginate(options).then(res => {
            let response = {
                draw: body.draw,
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "Room get failed..!!!" });
        })
    });
};
exports.updateRoomDate = (body) => {
    return new Promise((resolve, reject) => {
        let workingDays = body.days;
        let dayIndex = [];
        if (workingDays.sunday) {
            dayIndex.push(0);
        }
        if (workingDays.monday) {
            dayIndex.push(1);
        }
        if (workingDays.tuesday) {
            dayIndex.push(2);
        }
        if (workingDays.wednesday) {
            dayIndex.push(3);
        }
        if (workingDays.thursday) {
            dayIndex.push(4);
        }
        if (workingDays.friday) {
            dayIndex.push(5);
        }
        if (workingDays.saturday) {
            dayIndex.push(6);
        }
        let startDate = body.startDate;
        let endDate = body.endDate;
        let dateAvailability = [];
        for (let m = moment(startDate, 'DD-MM-YYYY'); m.diff(moment(endDate, 'DD-MM-YYYY'), 'days') <= 0; m.add(1, 'days')) {
            if (dayIndex.includes(parseInt(m.format('d')))) {
                dateAvailability.push({
                    roomId: body.roomId,
                    date: m.format('YYYY-MM-DD'),
                    BBAOne: body.BBAOne,
                    BBATwo: body.BBATwo,
                    ROAOne: body.ROAOne,
                    ROATwo: body.ROATwo,
                    bookedCount: 0
                });
            }
        }
        RoomDate.bulkCreate(dateAvailability).then(dA => {
            resolve(dA);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.getRoomIdsBasedOnSearchDatas = (body) => {
    return new Promise((resolve, reject) => {
        let roomCountQ = ``;
        let adultQ = ``;
        let childQ = ``;
        let branchQ = ``;
        let roomCategoryQ = ``;
        let bedTypesQ = ``;
        let priceQ = ``;
        if (body.roomCount != null && body.roomCount != 0) {
            roomCountQ = `and (rooms.count - room_dates.bookedCount) > ${body.roomCount}`;
        }
        // if(body.adult != null && body.adult != 0){
        //     adultQ = `and rooms.adultCount*(rooms.count - room_dates.bookedCount) >= ${body.adult}`;
        // }
        // if(body.child != null && body.child != 0){
        //     childQ = `and rooms.childCount*(rooms.count - room_dates.bookedCount) >= ${body.child}`;
        // }
        if (body.branch) {
            branchQ = `and branches.id = ${body.branch}`
        }
        if (body.roomCategory) {
            roomCategoryQ = `and room_categories.id = ${body.roomCategory}`
        }
        if (body.bedTypes.length != 0) {
            bedTypesQ = `and bed_types.id IN (${body.bedTypes.join()} )`
        }
        if (body.bedTypes.length != 0) {
            bedTypesQ = `and bed_types.id IN (${body.bedTypes.join()} )`
        }
        if (body.priceTo) {
            priceQ = `and LEAST(room_dates.BBAOne,room_dates.BBATwo,room_dates.ROAOne,room_dates.ROATwo) BETWEEN ${body.priceFrom} and ${body.priceTo}`
        }
        console.log(moment(body.checkIn).format("YYYY-MM-DD"), moment(body.checkOut).format("YYYY-MM-DD"))
        let query = `
        SELECT roomId from(SELECT 
            TIMESTAMPDIFF(day,'${moment(body.checkIn).format("YYYY-MM-DD")}','${moment(body.checkOut).format("YYYY-MM-DD")}') AS dateDiff,
            SUM(rooms.count - room_dates.bookedCount) as roomCount ,
            count('roomId') as roomIdCount,
            rooms.id as 'roomId' 
        from room_dates 
            JOIN rooms on room_dates.roomId = rooms.id 
            JOIN branches on  rooms.branchId = branches.id 
            JOIN room_categories on rooms.roomCategoryId = room_categories.id 
            JOIN bed_types on rooms.bedTypeId = bed_types.id 
        where room_dates.date BETWEEN '${moment(body.checkIn).format('YYYY-MM-DD')}' and '${moment(body.checkOut).subtract(1, 'days').format('YYYY-MM-DD')}' 
        ${branchQ} 
        ${roomCountQ} 
        ${adultQ} 
        ${childQ} 
        ${roomCategoryQ} 
        ${bedTypesQ} 
        ${priceQ} 
        group by roomId) as newRoom where dateDiff < roomCount and dateDiff = roomIdCount`
        // group by roomId) as newRoom where dateDiff < roomCount`
        sequelize.query(query, { type: QueryTypes.SELECT }).then(res => {
            resolve(_.map(res, function (res) { return res.roomId; }));
        }, err => {
            reject({ message: "Fetching Failed..!!!" });
        });
    })
}
exports.searchRoomCopy = (body) => {
    return new Promise((resolve, reject) => {
        let query = "SELECT rooms.*,room_dates.id as 'roomDates.id', room_dates.date as 'roomDates.date' from rooms left JOIN room_dates on rooms.id = room_dates.roomId where room_dates.date BETWEEN '2020-03-31' and '2020-04-04'";

        sequelize.query(query, { type: Sequelize.QueryTypes.SELECT }).then(res => {
            resolve(res);
        }, err => {
            reject({ message: "Fetching Failed..!!!" });
        });
    });
};
exports.searchRoom = (body) => {
    return new Promise((resolve, reject) => {
        console.log(body)
        const options = {
            page: body.page,
            paginate: 1000,
            plane: true,
            where: {
                id: {
                    [Op.in]: body.roomIds
                }
            },
            attributes: [
                'id', 'adultCount', 'childCount', 'count'
            ],
            include: [
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')), 'path']],
                    model: RoomImages, as: 'roomImages'
                }, {
                    attributes: ['id', 'name', 'nameAr'],
                    model: RoomCategory, as: 'roomCategory'
                }, {
                    attributes: [[Sequelize.fn('LEAST', Sequelize.col('BBAOne'), Sequelize.col('BBATwo')), 'BBPrice'], [Sequelize.fn('LEAST', Sequelize.col('ROAOne'), Sequelize.col('ROATwo')), 'ROPrice'], 'bookedCount'],
                    model: RoomDate, as: 'roomDate',
                    where: {
                        date: {
                            [Op.between]: [moment(body.checkIn).format('YYYY-MM-DD'), moment(body.checkOut).subtract(1, 'days').format('YYYY-MM-DD')]
                        }
                    }
                },
                {
                    attributes: ['id', 'name', 'nameAr', 'iconName'],
                    model: Amenities, as: 'roomAmenities'
                },
                {
                    attributes: ['id', 'name', 'nameAr', 'rating'],
                    model: Branch, as: 'branch'
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: BedType, as: 'bedType'
                },
                {
                    attributes: ['createdAt'],
                    model: BookingRoom, as: 'bookingRoom',
                    order: [['id', 'DESC']],
                    limit: 1
                }
            ]
        }
        console.log(options)

        Room.paginate(options).then(res => {
            res.docs.map((d, i) => {
                let data = d.toJSON();
                res.docs[i] = data;
                res.docs[i]['rating'] = d.branch.dataValues.rating;
                res.docs[i].BBPrice = (_.min(_.map(d.roomDate, function (roomDate) { return roomDate.dataValues.BBPrice; })));
                res.docs[i].ROPrice = (_.min(_.map(d.roomDate, function (roomDate) { return roomDate.dataValues.ROPrice; })));
                res.docs[i].bookedCount = (_.max(_.map(d.roomDate, function (roomDate) { return roomDate.dataValues.bookedCount; })));
            })
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
exports.checkAvailability = (body) => {
    return new Promise((resolve, reject) => {
        sequelize.query('select room_dates.date from rooms JOIN room_dates on rooms.id = room_dates.roomId and room_dates.date BETWEEN :checkIn and :checkOut and rooms.id =:roomId  ',
            { replacements: { checkIn: body.checkIn, checkOut: moment(body.checkOut, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD'), roomId: body.roomId }, type: QueryTypes.SELECT }
        ).then(res => {
            let b = moment(body.checkIn, 'YYYY-MM-DD');
            let a = moment(body.checkOut, 'YYYY-MM-DD').subtract(1, 'days');
            let c = a.diff(b, 'days') + 1;
            console.log(c, res.length);
            resolve(res.length == c);

        }, err => {
            reject({ message: "unavailable..!!!" });
        });
    });
};
exports.listBedTypes = () => {
    return new Promise((resolve, reject) => {
        BedType.findAll({
            attributes: ['id', 'name', 'nameAr']
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.listCountries = () => {
    return new Promise((resolve, reject) => {
        Country.findAll({
            attributes: ['id', 'name', 'nameAr', 'alpha', 'code']
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.setRoomFeatured = (id) => {
    return new Promise((resolve, reject) => {
        Room.update({
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
exports.setRoomUnfeatured = (id) => {
    return new Promise((resolve, reject) => {
        Room.update({
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
exports.listFeaturedRooms = () => {
    return new Promise((resolve, reject) => {
        Room.findAll({
            where: {
                featured: 1
            },
            attributes: [
                'id', 'description', 'descriptionAr', 'roomCategoryId', 'bedTypeId', 'adultCount', 'childCount', 'count'
            ],
            include: [
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')), 'path']],
                    model: RoomImages, as: 'roomImages'
                }, {
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
                    attributes: ['id', 'name', 'nameAr'],
                    model: Branch, as: 'branch'
                }
            ]
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.findAllRoomAvailabilitiesByBranch = (start, end, branchId) => {
     
    return new Promise((resolve, reject) => {
        Room.findAll({
            attributes: ['id', 'count', 'BBAOnePercent', 'BBATwoPercent', 'ROATwoPercent'],
            include: [
                {
                    attributes: ['id', 'name'],
                    model: RoomCategory, as: 'roomCategory'
                },
                {
                    attributes: ['id', 'name'],
                    model: Branch, as: 'branch',
                    where: {
                        id: branchId
                    }
                },

                {
                    where: {
                        date: {
                            [Op.between]: [start, end]
                        },
                        roomId: {
                            [Op.ne]: null
                        }
                    },
                    attributes: [
                        'id', 'date', 'BBAOne', 'BBATwo', 'ROAOne', 'ROATwo', 'bookedCount', 'roomId'
                    ],
                    model: RoomDate, as: 'roomDate',
                    required: false
                },
                {
                    where: {
                        date: {
                            [Op.between]: [start, end]
                        },
                        roomId: {
                            [Op.ne]: null
                        }
                    },
                    attributes: [
                        'count', 'date', "roomId"
                    ],
                    model: RoomCount, as: 'roomCount',
                    required: false
                }
            ]
        }).then(res => {
            //console.log(res[0])
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.updateRoomPricing = (data, id) => {
    return new Promise((resolve, reject) => {
        console.log(data, id);
        RoomDate.update({
            BBAOne: data.BBAOne,
            BBATwo: data.BBATwo,
            ROAOne: data.ROAOne,
            ROATwo: data.ROATwo
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
exports.updateRoomPricingValue = (data) => {
    return new Promise((resolve, reject) => {
        let query = '', bbaone = '', bbatwo = '', roaone = '', roatwo = '', ids = '';
        data.update.map((d, k) => {
            bbaone += ' WHEN ' + d.id + ' THEN ' + d.BBAOne;
            bbatwo += ' WHEN ' + d.id + ' THEN ' + d.BBATwo;
            roaone += ' WHEN ' + d.id + ' THEN ' + d.ROAOne;
            roatwo += ' WHEN ' + d.id + ' THEN ' + d.ROATwo;
            ids += d.id + (k == (data.update.length - 1) ? '' : ',');
        })
        query += 'UPDATE room_dates SET BBAOne = CASE id ';
        query += bbaone;
        query += ' END, BBATwo = CASE id ';
        query += bbatwo;
        query += ' END, ROAOne = CASE id ';
        query += roaone;
        query += ' END, ROATwo = CASE id ';
        query += roatwo;
        query += ' END WHERE id IN (';
        query += ids;
        query += ')';
        sequelize.query(query, { type: QueryTypes.BULKUPDATE }).then(res => {
            resolve({ message: "Updated..!!!" });
        }, err => {
            reject({ message: "Update Failed..!!!" });
        });
    });
};
exports.createRoomPricingValue = (data) => {
    console.log("data", data)
    return new Promise((resolve, reject) => {
        RoomDate.bulkCreate(data.create).then(res1 => {
            console.log(res1);
            resolve({ message: "Updated..!!!" });
        }, err => {
            reject({ message: "Create Failed..!!!" });
        });
    });
};



// exports.roomPricingBulkUpdate = (data) => {
//     return new Promise((resolve, reject) => {
//         let query = '',bbaone = '',bbatwo = '',roaone = '',roatwo = '',ids = '';
//         data.dates.map((d,k)=>{
//             bbaone += ' WHEN '+d.id+' THEN '+data.BBAOne;
//             bbatwo += ' WHEN '+d.id+' THEN '+data.BBATwo;
//             roaone += ' WHEN '+d.id+' THEN '+data.ROAOne;
//             roatwo += ' WHEN '+d.id+' THEN '+data.ROATwo;
//             ids += d.id+(k == (data.dates.length-1)?'':',');
//         })
//         query+='UPDATE room_dates SET BBAOne = CASE id ';
//         query+=bbaone;
//         query+=' END, BBATwo = CASE id ';
//         query+=bbatwo;
//         query+=' END, ROAOne = CASE id ';
//         query+=roaone;
//         query+=' END, ROATwo = CASE id ';
//         query+=roatwo;
//         query+=' END WHERE id IN (';
//         query+=ids;
//         query+=')';
//         sequelize.query(query,{type: QueryTypes.BULKUPDATE }).then(res => {
//             console.log(res);
//             resolve({ message: "Updated..!!!" });
//         }, err => {
//             reject({ message: "Update Failed..!!!" });
//         });
//     });
// };
exports.findAllRoomAvailabilitiesByRoom = (start, end, id) => {
    return new Promise((resolve, reject) => {
        RoomDate.findAll({
            where: {
                date: {
                    [Op.between]: [start, end]
                },
                roomId: id
            },
            attributes: [
                'id', 'date'
            ],
            include: [
                {
                    attributes: ['id'],
                    model: Room, as: 'room',
                    include: [
                        {
                            attributes: ['id', 'name', 'nameAr'],
                            model: RoomCategory, as: 'roomCategory'
                        }
                    ]
                }
            ]
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.deleteRoomAddon = (id) => {
    return new Promise((resolve, reject) => {
        // Addon.findByPk(id).then(res => {
        //     fs.unlinkSync(res.dataValues.image);
        Addon.destroy({
            where: {
                id: id
            }
        }).then(res => {
            if (res == 0) {
                reject({ message: "Addon delete failed..!!!" });
            } else {
                resolve({ message: "Addon deleted..!!!" });
            }
        }, err => {
            reject({ error: err });
        });
        // }, err => {
        //     reject({ error: err });
        // });
    });
};
exports.getOtherRooms = (id) => {
    return new Promise((resolve, reject) => {
        Room.findAll({
            where: {
                id: {
                    [Op.ne]: id
                }
            },
            attributes: [
                'id', 'description', 'descriptionAr', 'count'
            ],
            include: [
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: RoomCategory, as: 'roomCategory'
                },
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')), 'path']],
                    model: RoomImages, as: 'roomImages'
                },
                {
                    attributes: ['id', 'name', 'nameAr', 'address', 'addressAr', 'lat', 'lng'],
                    model: Branch, as: 'branch'
                }
            ]
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.updateRelatedRooms = (rooms, id) => {
    return new Promise((resolve, reject) => {
        RelatedRooms.destroy({
            where: {
                roomId: id
            }
        }).then(res => {
            RelatedRooms.bulkCreate(rooms).then(res => {
                resolve(res);
            }, err => {
                reject({ error: err });
            });
        }, err => {
            reject({ error: err });
        });
    });
};
exports.getRelatedRooms = (id) => {
    return new Promise((resolve, reject) => {
        RelatedRooms.findAll({
            where: {
                roomId: id
            }
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.listOfferedRooms = (id) => {
    return new Promise((resolve, reject) => {
        Room.findAll({
            attributes: [
                'id', 'description', 'descriptionAr', 'roomCategoryId', 'bedTypeId', 'adultCount', 'childCount', 'count'
            ],
            include: [
                {
                    attributes: ['id', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('path')), 'path']],
                    model: RoomImages, as: 'roomImages'
                }, {
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
                    attributes: ['id', 'offerPercent'],
                    model: Offer, as: 'offer',
                    where: {
                        offerPercent: {
                            [Op.ne]: null
                        }
                    }
                },
                {
                    attributes: ['id', 'name', 'nameAr'],
                    model: Branch, as: 'branch'
                }
            ]
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.getUniqueAddons = () => {
    return new Promise((resolve, reject) => {
        Addon.findAll({
            attributes: ['id', 'name', 'nameAr', 'description', 'descriptionAr', [Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')), 'path'], 'image', 'multiple', 'price']
        }).then(res => {
            let uniqueList = _.uniq(res, function (item, key, a) {
                return item.a;
            });
            resolve(uniqueList);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.updateRoomCount = (id, data) => {
    console.log(id, data,)
    return new Promise((resolve, reject) => {
        Room.update(data, {
            where: {
                id: id
            }
        }).then(room => {
            if (room.length == 0) {
                reject({ message: "Room update failed..!!!" });
            } else {
                resolve({ message: "Room updated..!!!" });
            }
        }, err => {
            reject({ error: err });
        });
    });
};

exports.updateRoomCountWithDate = (data) => {
    // console.log("data", data)
    let newData = []
    return new Promise((resolve, reject) => {

        RoomCount.findAll({ roomId: data[0].roomId }).then(res => {
            console.log("findAll : ",)
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < res.length; j++) {
                    // console.log(data[i].roomId, data[i].date)
                    // console.log(res[j].roomId, res[j].date)
                    if ((data[i].date == res[j].date && (data[i].roomId == res[j].roomId))) {
                        newData.push(data[i])
                        console.log(res[j].id)
                        RoomCount.update(data[i], {
                            where: {
                                id: res[j].id
                            }
                        }).then(roomCount => {
                            if (roomCount.length == 0) {
                                // reject({ message: "Room update failed..!!!" });
                                console.log({ message: "Room update failed..!!!" });

                            } else {
                                // resolve({ message: "Room updated..!!!" });
                                console.log({ message: "Room updated..!!!" });

                            }
                        }, err => {
                            // reject({ error: err });
                            console.log({ error: err });
                        });
                    }
                }
            }
            // console.log(newData.length, "dates updated")

            console.log("new", newData)
            const DIFFERENCE_OF_ARRAYS = (firstArray, secondArray) => {
                return firstArray.filter(firstArrayItem =>
                    !secondArray.some(
                        secondArrayItem => firstArrayItem === secondArrayItem
                    )
                );
            };
            // console.log(DIFFERENCE_OF_ARRAYS(data, newData))
            var dataToCreate = DIFFERENCE_OF_ARRAYS(data, newData)

            RoomCount.bulkCreate(dataToCreate, {

            }).then(roomCount => {
                // console.log(roomCount)
                resolve({
                    message: {
                        create: dataToCreate.length + " rooms created..!!!",
                        update: newData.length + " rooms updated"
                    }
                });
            }, err => {
                reject({ error: err });
            });

        }).catch(err => {
            console.log("findAll errr : ", err)
        })
    });
};