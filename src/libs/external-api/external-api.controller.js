const ExternalApiModel = require('./external-api.model');
const crypto = require('crypto');

exports.requestPayment = (req, res) => {
    ExternalApiModel.requestPayment(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};