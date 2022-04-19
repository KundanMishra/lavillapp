const PropertyModel = require('./property.model');
const crypto = require('crypto');

exports.insert = (req, res) => {
    let images = [];
    req.files.map(file=>{
        images.push({ 
            path:`uploads/property/${file.filename}`
        });
    }) 
    req.body.propertyImages = images;
    PropertyModel.createProperty(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.editProperty = (req, res,next) => { 
    let images = [];
    req.files.map(file => {
        images.push({
            propertyId: req.params.roomId || req.params.propertyId,
            path: file.path 
        });
    })
    req.body.propertyImages = images;
    PropertyModel.editProperty(req.body,req.params.propertyId)
    .then((result) => {
        next();
    }, err => {
        res.status(406).send(err);
    });

};
exports.updatePropertyImages = (req, res, next) => {
    console.log("body",req.body)
    PropertyModel.updatePropertyImages(req.body)
        .then((result) => {
            console.log(req.body)
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};

exports.getProperty = (req, res) => {
    PropertyModel.getProperty(req.params.propertyId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.findAllProperty = (req, res) => {
    
    PropertyModel.findAllProperty(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllProperty = (req, res) => {
    
    PropertyModel.listAllProperty()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getAllProperty = (req, res) => {
    
    PropertyModel.getAllProperty()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.deleteProperty = (req, res) => {
    PropertyModel.deleteProperty(req.params.propertyId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.searchProperty = (req, res) => {
    PropertyModel.searchProperty(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllPropertyType = (req, res) => {
    PropertyModel.listAllPropertyType()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllPropertyLookingFor = (req, res) => {
    PropertyModel.listAllPropertyLookingFor()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllPropertyPurpose = (req, res) => {
    PropertyModel.listAllPropertyPurpose()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllPropertyLocation = (req, res) => {
    PropertyModel.listAllPropertyLocation()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getFeaturedProperty = (req, res) => {
    PropertyModel.getFeaturedProperty()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.setPropertyFeatured = (req, res) => {
    PropertyModel.setPropertyFeatured(req.params.propertyId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.setPropertyUnfeatured = (req, res) => {
    PropertyModel.setPropertyUnfeatured(req.params.propertyId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};