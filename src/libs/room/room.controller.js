const RoomModel = require('./room.model');
const crypto = require('crypto');
const moment = require('moment');
exports.insert = (req, res, next) => {
    let images = [];
    req.files.map(file => {
        images.push({
            path: `uploads/room/${file.filename}`
        });
    })
    req.body.roomImages = images;
    RoomModel.createRoom(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.editRoom = (req, res, next) => {
    let images = [];
    req.files.map(file => {
        images.push({
            roomId: req.params.roomId,
            path: `uploads/room/${file.filename}`

        });
    })
    req.body.roomImages = images;
    RoomModel.editRoom(req.body, req.params.roomId)
        .then((result) => {
            // res.status(200).send(result);
            next();
        }, err => {
            res.status(406).send(err);
        });

};
exports.updateRoomImages = (req, res, next) => {
    RoomModel.updateRoomImages(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.insertAddon = (req, res, next) => {
    req.body.image = `uploads/room-addon/${req.file.filename}`;
    RoomModel.createRoomAddon(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.insertChoosingAddon = (req, res, next) => {
    RoomModel.createRoomAddon(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getRoom = (req, res) => {
    RoomModel.getRoom(req.params.roomId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.searchRoomAvailability = (req, res) => {
    RoomModel.searchRoomAvailability(req.body, 0)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.searchEditRoomAvailability = (req, res) => {
    RoomModel.searchRoomAvailability(req.body, 1)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.findAllRoom = (req, res) => {
    RoomModel.findAllRoom()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllRoom = (req, res) => {
    RoomModel.listAllRoom(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.findAllRoomBedType = (req, res) => {
    RoomModel.findAllRoomBedType()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
// ************************************************************************

// exports.deleteRoomImageCascade = (req, res,next) => {
//     RoomModel.deleteRoomImageCascade(req.params.roomId)
//         .then((result) => {
//             next();
//         }, err => {
//             res.status(406).send(err);
//         });
// };
// exports.deleteRoomDateCascade = (req, res,next) => {
//     RoomModel.deleteRoomDateCascade(req.params.roomId)
//         .then((result) => {
//             next();
//         }, err => {
//             res.status(406).send(err);
//         });
// };
// exports.deleteRoomAddonCascade = (req, res,next) => {
//     RoomModel.deleteRoomAddonCascade(req.params.roomId)
//         .then((result) => {
//             next();
//         }, err => {
//             res.status(406).send(err);
//         });
// };
// exports.deleteRoomAddonCascade = (req, res,next) => {
//     RoomModel.deleteRoomAddonCascade(req.params.roomId)
//         .then((result) => {
//             next();
//         }, err => {
//             res.status(406).send(err);
//         });
// };
// exports.deleteRoomWhatsNearByCascade = (req, res,next) => {
//     RoomModel.deleteRoomAddonCascade(req.params.roomId)
//         .then((result) => {
//             next();
//         }, err => {
//             res.status(406).send(err);
//         });
// };
exports.deleteRoom = (req, res) => {
    RoomModel.deleteRoom(req.params.roomId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};







// ************************************************************************
exports.findAllRoomAddon = (req, res) => {
    RoomModel.findAllRoomAddon(req.params.roomId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.updateRoomDate = (req, res) => {
    RoomModel.updateRoomDate(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getRoomIds = (req, res, next) => {
    RoomModel.getRoomIdsBasedOnSearchDatas(req.body)
        .then((result) => {
            console.log(result);
            req.body.roomIds = result;
            next();
        }, err => {
            res.status(406).send(err);
        });
};
exports.getRoomIdsReturn = (req, res) => {
    res.status(200).send(req.body.roomIds);
};
exports.searchRoom = (req, res) => {
    RoomModel.searchRoom(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.checkAvailability = (req, res) => {
    RoomModel.checkAvailability(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listBedTypes = (req, res) => {
    RoomModel.listBedTypes()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listCountries = (req, res) => {
    RoomModel.listCountries()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.setRoomFeatured = (req, res) => {
    RoomModel.setRoomFeatured(req.params.roomId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.setRoomUnfeatured = (req, res) => {
    RoomModel.setRoomUnfeatured(req.params.roomId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listFeaturedRooms = (req, res) => {
    RoomModel.listFeaturedRooms()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.findAllRoomAvailabilitiesByBranch = (req, res) => {
    RoomModel.findAllRoomAvailabilitiesByBranch(req.body.start, req.body.end, req.params.branchId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.updateRoomPricing = (req, res) => {
    RoomModel.updateRoomPricing(req.body, req.params.roomDateId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.updateRoomPricingValue = (req, res, next) => {
    if (req.body.update.length > 0) {
        RoomModel.updateRoomPricingValue(req.body)
            .then((result) => {
                next();
            }, err => {
                res.status(406).send(err);
            });
    } else {
        next();
    }

};

exports.createRoomPricingValue = (req, res) => {
    RoomModel.createRoomPricingValue(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
// exports.roomPricingBulkUpdate = (req, res) => {
//     RoomModel.roomPricingBulkUpdate(req.body)
//         .then((result) => {
//             res.status(200).send(result);
//         }, err => {
//             res.status(406).send(err);
//         });
// };
exports.findAllRoomAvailabilitiesByRoom = (req, res) => {
    RoomModel.findAllRoomAvailabilitiesByRoom(req.body.start, req.body.end, req.params.roomId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.deleteRoomAddon = (req, res) => {
    RoomModel.deleteRoomAddon(req.params.addonId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getOtherRooms = (req, res) => {
    RoomModel.getOtherRooms(req.params.roomId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.updateRelatedRooms = (req, res) => {
    RoomModel.updateRelatedRooms(req.body.rooms, req.params.roomId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getRelatedRooms = (req, res) => {
    RoomModel.getRelatedRooms(req.params.roomId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listOfferedRooms = (req, res) => {
    RoomModel.listOfferedRooms()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getUniqueAddons = (req, res) => {
    RoomModel.getUniqueAddons()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.updateRoomCount = (req, res) => {
    RoomModel.updateRoomCount(req.params.roomId, req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.updateRoomCountWithDate = (req, res) => {
    console.log("controller")
    RoomModel.updateRoomCountWithDate(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            console.log(err)
            res.status(406).send(err);
        });
};