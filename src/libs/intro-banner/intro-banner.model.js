const Sequelize = require('sequelize');
const multer = require('multer');
const env = require('../../configs/env');
const Op = Sequelize.Op;

const sequelize = require('../../configs/connection');
const IntroBanner = require('../../models/intro-banner')(sequelize, Sequelize);

IntroBanner.sync();
exports.uploadIntroBanner = multer({
    storage: multer.diskStorage({
        destination: 'uploads/banners/',
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    })
}).single('introBanner'); 
exports.findAllIntroBanner = (body) => {
    return new Promise((resolve, reject) => {
        let page = (body.start + body.length) / body.length;
        let attributes = [];
        body.columns.map(c => {
            if(c.data == "image"){
                attributes.push([Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')),'image']);
            }else{
                attributes.push(c.data);
            }
        }); 
        let orderC = (body.order[0].column == 0)?('image'):(attributes[body.order[0].column]);
        let orderD = body.order[0].dir;

        const options = {
            attributes: attributes,
            page: page,
            paginate: body.length,
            order: [[orderC, orderD]],
            where: {
                description: { [Op.like]: `%${body.search.value}%` }
            }
        }
        IntroBanner.paginate(options).then(res => {
            let response = {
                draw: body.draw,
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: res.docs
            }
            resolve(response);
        }, err => {
            reject({ message: "Banner get failed..!!!",err:err });
        }) 
    });
};
exports.getIntroBannerWithStatus = () => {
    return new Promise((resolve, reject) => {
        IntroBanner.findAll({
            attributes: ['id', 'link','description', 'descriptionAr' ,[Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')),'image'],'status'],
            where: {
                status: true
            }
        }).then(introbanners => {
            resolve(introbanners);
        },err=>{
            reject({error:err});
        })
    });
};

exports.findIntroBannerById = (id) => {
    return new Promise((resolve, reject) => {
        IntroBanner.findOne({
            attributes: ['id', 'link','description', 'descriptionAr' ,[Sequelize.fn('CONCAT', env.apiEndpoint, Sequelize.col('image')),'image'],'status'],
            where: {
                id: id
            }
        }).then(introbanners => {
            if(introbanners == null){
                reject({status:404,message:"Intro Banner not found"});
            }
            resolve(introbanners);
        },err=>{
            reject({error:err});
        })
    });
};
exports.createIntroBanner = (userData) => {
    return new Promise((resolve, reject) => {
        IntroBanner.create(userData).then(introbanner => {
            resolve(introbanner);
        },err=>{
            reject({error:err});
        });
    });
};
exports.updateIntroBannerById = (userData,id) => {
    console.log("start");
    console.log(typeof userData);
    console.log("end");
    return new Promise((resolve, reject) => {
        IntroBanner.update(userData, {
            where: {
              id: id
            }
          }).then(introbanner => {
            IntroBanner.findByPk(id).then(introbanners => {
                resolve(introbanners);
            },err1=>{
                reject({error:err1});
            })
        },err=>{
            reject({error:err});
        });
    });
};
exports.deleteIntroBannerById = (id) => {
    return new Promise((resolve, reject) => {
        IntroBanner.destroy({
            where: {
              id: id
            }
          }).then(() => {
            resolve({message:"Delete Successfull!!!"});
        },err=>{
            reject({error:err});
        });
    });
};