const RoomCategoryModel = require('./room-category.model');
const crypto = require('crypto');

exports.insert = (req, res) => {
    RoomCategoryModel.createRoomCategory(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.editRoomCategory = (req, res) => { 
    RoomCategoryModel.editRoomCategory(req.body,req.params.roomCategoryId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};

exports.getRoomCategory = (req, res) => {
    RoomCategoryModel.getRoomCategory(req.params.roomCategoryId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.findAllRoomCategory = (req, res) => {
    
    RoomCategoryModel.findAllRoomCategory(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllRoomCategory = (req, res) => {
    
    RoomCategoryModel.listAllRoomCategory()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllRoomCategoryByBranch = (req, res) => {
    
    RoomCategoryModel.listAllRoomCategoryByBranch(req.params.branch)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getAllRoomCategory = (req, res) => {
    
    RoomCategoryModel.getAllRoomCategory()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.checkRoomCategoryDelete = (req, res,next) => {
    RoomCategoryModel.checkRoomCategoryDelete(req.params.roomCategoryId)
        .then((result) => {
            next();
        }, err => {
            res.status(406).send(err);
        });

};
exports.deleteRoomCategory = (req, res) => {
    RoomCategoryModel.deleteRoomCategory(req.params.roomCategoryId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};