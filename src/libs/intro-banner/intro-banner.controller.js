const IntroBannerModel = require('./intro-banner.model');
const Sequelize = require('sequelize');
const sequelize = require('../../configs/connection');
const IntroBanner = require('../../models/intro-banner')(sequelize, Sequelize);
const crypto = require('crypto');
const fs = require('fs');

exports.insert = (req, res) => {
    let data = {};
    req.body.image = `uploads/banners/${req.file.filename}`;
    Object.assign(data, req.body);
    IntroBannerModel.createIntroBanner(req.body).then((result) => {
        res.status(201).send(result);
    },err=>{
        res.status(406).send(err);
    });
};
exports.findIntroBannerById = (req, res) => {
    IntroBannerModel.findIntroBannerById(req.params.introBannerId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(err.status).send(err.message);
        });
};
exports.updateIntroBannerById = (req, res) => {
    if (req.file != undefined) {
        req.body.image = `uploads/banners/${req.file.filename}`;
        let id = req.params.introBannerId
        IntroBanner.findOne({
            where: {
                id: id
            }
        }).then(result => {
          
            IntroBannerModel.updateIntroBannerById(req.body, id)
            .then((r) => {
                res.status(200).send(r);
            },err1=>{
                res.status(406).send(err1);
            });
            if (result.dataValues.image != null) {
                fs.unlinkSync(result.dataValues.image);
            }
        },err=>{
            reject({error:err});
        })
    } else {

        IntroBannerModel.updateIntroBannerById(req.body, req.params.introBannerId)
            .then((result) => {
                res.status(200).send(result);
            },err=>{
                res.status(406).send(err);
            });
    }

};
exports.deleteIntroBannerById = (req, res) => {
    let id =req.params.introBannerId;
    IntroBanner.findOne({
        where: {
            id: id
        }
    }).then(result => {
       
        IntroBannerModel.deleteIntroBannerById(id)
        .then((r) => {
            res.status(200).send(r);
        },err1=>{
            res.status(406).send(err1);
        });
        if (result.dataValues.image != null) {
            fs.unlinkSync(result.dataValues.image);
        }
    },err=>{
        reject({error:err});
    })
};
exports.findAllIntroBanner = (req, res) => {
    IntroBannerModel.findAllIntroBanner(req.body)
        .then((result) => {
            res.status(200).send(result);
        },err=>{
            res.status(406).send(err);
        });
};
exports.getIntroBannerWithStatus = (req, res) => {
    IntroBannerModel.getIntroBannerWithStatus()
        .then((result) => {
            res.status(200).send(result);
        },err=>{
            res.status(406).send(err);
        });
};