const AmenitiesModel = require('./amenities.model');
const crypto = require('crypto');

exports.insert = (req, res) => {
    AmenitiesModel.createAmenities(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.editAmenities = (req, res) => { 
    AmenitiesModel.editAmenities(req.body,req.params.amenitiesId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};

exports.getAmenities = (req, res) => {
    AmenitiesModel.getAmenities(req.params.amenitiesId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.findAllAmenities = (req, res) => {
    AmenitiesModel.findAllAmenities()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.findAllRoomAmenities = (req, res) => {
    AmenitiesModel.findAllRoomAmenities()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.findAllPropertyAmenities = (req, res) => {
    AmenitiesModel.findAllPropertyAmenities()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllAmenities = (req, res) => { 
    AmenitiesModel.listAllAmenities(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.findAllAmenitiesType = (req, res) => {
    AmenitiesModel.findAllAmenitiesType()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.findAllAmenitiesIcon = (req, res) => {
    AmenitiesModel.findAllAmenitiesIcon()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.deleteAmenities = (req, res) => {
    AmenitiesModel.deleteAmenities(req.params.amenitiesId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.setAmenitiesFeatured = (req, res) => {
    AmenitiesModel.setAmenitiesFeatured(req.params.amenitiesId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.setAmenitiesUnfeatured = (req, res) => {
    AmenitiesModel.setAmenitiesUnfeatured(req.params.amenitiesId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listFeaturedAmenities = (req, res) => {
    AmenitiesModel.listFeaturedAmenities()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};