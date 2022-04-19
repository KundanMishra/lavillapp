const LoyaltyModel = require('./loyalty.model');
const crypto = require('crypto');

exports.insert = (req, res) => {
    LoyaltyModel.createLoyalty(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getLoyalty = (req, res) => {
    LoyaltyModel.getLoyalty(req.params.loyaltyId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.getLastLoyalty = (req, res) => {
    LoyaltyModel.getLastLoyalty()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.findAllLoyalty = (req, res) => {
    
    LoyaltyModel.findAllLoyalty(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getAllLoyalty = (req, res) => {
    
    LoyaltyModel.getAllLoyalty()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};