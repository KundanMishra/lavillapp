const OfferModel = require('./offer.model');
const crypto = require('crypto');

exports.insert = (req, res) => { 
    OfferModel.createOffer(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.editOffer = (req, res) => { 
    OfferModel.editOffer(req.body,req.params.offerId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.getOffer = (req, res) => {
    OfferModel.getOffer(req.params.offerId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.findAllOffer = (req, res) => {
    OfferModel.findAllOffer(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllOffer = (req, res) => {
    
    OfferModel.listAllOffer()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getAllOffer = (req, res) => {
    
    OfferModel.getAllOffer()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.deleteOffer = (req, res) => {
    OfferModel.deleteOffer(req.params.offerId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};