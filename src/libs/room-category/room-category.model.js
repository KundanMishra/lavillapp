const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { QueryTypes } = require('sequelize');
const sequelize = require('../../configs/connection');
const RoomCategory = require('../../models/room-category')(sequelize, Sequelize);
const Room = require('../../models/room')(sequelize, Sequelize);
RoomCategory.sync();
exports.createRoomCategory = (roomCategoryData) => {
    return new Promise((resolve, reject) => {
        RoomCategory.create(roomCategoryData).then(roomCategory => {
            resolve(roomCategory);
        }, err => {
            reject({ error: err });
        });
    });
};
exports.editRoomCategory = (body, id) => {
    return new Promise((resolve, reject) => {
        RoomCategory.update(body, {
            where: {
                id: id
            }
        }).then(roomCategory => {
            console.log(roomCategory);
            if (roomCategory.length == 0) {
                reject({ message: "Room Category update failed..!!!" });
            } else {
                resolve({ message: "Room Category updated..!!!" });
            }
        }, err => {
            reject({ message: "Room Category update failed..!!!" });
        });
    });
};
exports.getRoomCategory = (roomCategoryId) => {
    return new Promise((resolve, reject) => {
        RoomCategory.findByPk(roomCategoryId, {
            attributes: ['id', 'name','nameAr', 'featured']
        }).then(roomCategory => {
            resolve(roomCategory);
        }, err => {
            reject({ message: "Room Category update failed..!!!" });
        });
    });
};
exports.findAllRoomCategory = (body) => {
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
            where: { name: { [Op.like]: `%${body.search.value}%` } }
        }
        RoomCategory.paginate(options).then(res => {
            let response = {
                draw:body.draw,
                recordsTotal:res.total,
                recordsFiltered:res.total,
                data:res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "Room Category get failed..!!!" });
        })
    });
};
exports.listAllRoomCategory = () => {
    return new Promise((resolve, reject) => {
        RoomCategory.findAll({
            attributes:['id','name','nameAr','featured']
        }).then(res => {
            resolve(res);
        }, err => {
            reject({ message: "Room Category get failed..!!!" });
        })
    });
};
exports.listAllRoomCategoryByBranch = (branch) => {
    return new Promise((resolve, reject) => {
        sequelize.query('select id,name,nameAr from room_categories where id IN(select roomCategoryId from rooms where branchId = :branchId)',
            { replacements: { branchId: branch },type: QueryTypes.SELECT }
        ).then(res => {
            resolve(res);
        }, err => {
            reject({ message: "room Category get failed..!!!" });
        });
        // RoomCategory.findAll({
        //     attributes:['id','name','nameAr','featured']
        // }).then(res => {
        //     resolve(res);
        // }, err => {
        //     reject({ message: "Room Category get failed..!!!" });
        // })
    });
};
exports.getAllRoomCategory = () => {
    return new Promise((resolve, reject) => {
        RoomCategory.findAll({
            attributes: ['id', 'name', 'nameAr']
        }).then(roomCategory => {
            resolve(roomCategory);
        }, err => {
            reject({ message: "Room Category update failed..!!!" });
        });
    });
};
exports.checkRoomCategoryDelete = (roomCategoryId) => {
    return new Promise((resolve, reject) => {
        Room.findAll({
            where: {
                roomCategoryId: roomCategoryId
            },
        }).then(room => {
            console.log(room);
            if (room.length != 0) {
                reject({ message: "Room Category delete failed, Room Already exist belongs to this room category..!!!" });
            } else {
                resolve({ message: "Room Category deleted..!!!" });
            }
        }, err => {
            reject({ message: "Room Category delete failed..!!!" });
        });
    });
};
exports.deleteRoomCategory = (roomCategoryId) => {
    return new Promise((resolve, reject) => {
        RoomCategory.destroy({
            where: {
                id: roomCategoryId
            },
        }).then(roomCategory => {
            console.log(roomCategory);
            if (roomCategory == 0) {
                reject({ message: "Room Category delete failed..!!!" });
            } else {
                resolve({ message: "Room Category deleted..!!!" });
            }
        }, err => {
            reject({ message: "Room Category delete failed..!!!" });
        });
    });
};