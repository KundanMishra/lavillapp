const PromoCodeModel = require('./promo-code.model');
const crypto = require('crypto');

exports.insert = (req, res,next) => {
    PromoCodeModel.createPromoCode(req.body)
        .then((result) => {
            req.body.result = result;
            next();
        }, err => {
            res.status(406).send(err);
        });
};
exports.promoCodeMail = (req, res) => {
    PromoCodeModel.promoCodeMail(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.editPromoCode = (req, res) => { 
    PromoCodeModel.editPromoCode(req.body,req.params.promoCodeId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};

exports.getPromoCode = (req, res) => {
    PromoCodeModel.getPromoCode(req.params.promoCodeId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.findAllPromoCode = (req, res) => {
    PromoCodeModel.findAllPromoCode()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
}; 
exports.listAllPromoCode = (req, res) => {
    PromoCodeModel.listAllPromoCode(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.checkPromoCodeByUser = (req, res) => { 
    PromoCodeModel.checkPromoCodeByUser(req.jwt.userId,req.body.code)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.deletePromoCode = (req, res) => {
    PromoCodeModel.deletePromoCode(req.params.promoCodeId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.listAllAvailablePromoCode = (req, res) => {
    PromoCodeModel.listAllAvailablePromoCode(req.jwt.userId,req.params.branchId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};