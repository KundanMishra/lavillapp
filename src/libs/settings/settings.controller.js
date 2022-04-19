const SendMail = require('../send-email/index');
 const Sequelize = require('sequelize');
const sequelize = require('../../configs/connection');
const Branch = require('../../models/branch')(sequelize, Sequelize);
const Booking = require('../../models/booking')(sequelize, Sequelize);
const User = require('../../models/user')(sequelize, Sequelize);
const BranchRating = require('../../models/branch-rating')(sequelize, Sequelize);
Booking.belongsTo(Branch, { as: 'branch' });
BranchRating.belongsTo(User, { as: 'user' });
BranchRating.belongsTo(Branch, { as: 'branch' });
BranchRating.belongsTo(Booking, { as: 'booking' });

exports.contactUs = (req, res) => {
    Branch.findByPk(req.body.hotel).then(hotel => {
        let content = `
            <p><b>Hi,</p>
            <br /><br /><br /> 
            <p>Name:${req.body.name} </p>
            <p>Email:${req.body.email} </p>
            <p>Phone:${req.body.phone} </p>
            <p>Hotel:${hotel.dataValues.name} </p>
            <p>Comment:${req.body.comment}</p>
        `
        SendMail.sendEmail("dev@auratechnologies.in", "Contact Massage", content).then(resMail => {
            res.status(200).send({"message":"Send Successfully"});
             
        }, errMail => { 
            res.status(406).send({ error: errMail });
        })
    }, err => {
        res.status(406).send({ error: "Mail Send failed..!!!" });
    });
    
};
exports.getDashboardData = (req, res) => {
    sequelize.query(`select * from ((select count(*) as sales from bookings where bookings.bookingStatusId = 7) as b1 join (select count(*) as totalBooking from bookings ) as b2 join (select count(*) as todayBooking from bookings where DATE_FORMAT(bookings.createdAt, '%M %d %Y') = DATE_FORMAT(NOW(), '%M %d %Y')) as b3 join (select count(*) as totalCustomer from users where users.permissionLevel = 1) as c1 )`,
        {type: Sequelize.QueryTypes.SELECT }
    ).then(dashboardCount => {
        Booking.findAll({
            limit:10,
            include:[
                {
                    attributes:['name','id'],
                    model:Branch,
                    as:'branch'
                }
            ],
            order:[['id','DESC']]
        }).then(booking => {
            BranchRating.findAll({
                limit:10,
                include:[
                    {
                        attributes: ['id','fName','lName'],
                        model: User, as: 'user'
                    },
                    {
                        attributes: ['id','name'],
                        model: Branch, as: 'branch'
                    }
                ]
            }).then(branchRating => {
                res.status(200).send({dashboardCount:dashboardCount[0],booking:booking,feedbacks:branchRating});
            }, err => {
                res.status(406).send({ error:err });
            }); 
        }, err => {
            res.status(406).send({ error:err });
        }); 
    }, err => {
        res.status(406).send({ error:err });
    });
};