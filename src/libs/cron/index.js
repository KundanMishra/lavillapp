const Sequelize = require('sequelize');
const moment = require('moment');
const _ = require('underscore');

const sequelize = require('../../configs/connection');
const env = require('../../configs/env');
const Booking = require('../../models/booking')(sequelize, Sequelize);
const BookingAddon = require('../../models/booking-addon')(sequelize, Sequelize);
const BookingUser = require('../../models/booking-user')(sequelize, Sequelize);
const Addon = require('../../models/addon')(sequelize, Sequelize);
const User = require('../../models/user')(sequelize, Sequelize);
const Room = require('../../models/room')(sequelize, Sequelize);
const Branch = require('../../models/branch')(sequelize, Sequelize);
const BranchImages = require('../../models/branch-images')(sequelize, Sequelize);
const BedType = require('../../models/bed-type')(sequelize, Sequelize);
const RoomCategory = require('../../models/room-category')(sequelize, Sequelize);
const BookingStatus = require('../../models/booking-status')(sequelize, Sequelize);
const BookingCancellation = require('../../models/booking-cancellation')(sequelize, Sequelize);
const BookingRoom = require('../../models/booking-room')(sequelize, Sequelize);
const BookingOffer = require('../../models/booking-offer')(sequelize, Sequelize);
const RoomImages = require('../../models/room-images')(sequelize, Sequelize);
const BookingLoyalty = require('../../models/booking-loyalty')(sequelize, Sequelize);
const BookingPromoCode = require('../../models/booking-promo-code')(sequelize, Sequelize);
const BookingCard = require('../../models/booking-card')(sequelize, Sequelize);
const Loyalty = require('../../models/loyalty')(sequelize, Sequelize);
const RoomDate = require('../../models/room-date')(sequelize, Sequelize);
const BookingRoomDate = require('../../models/booking-room-date')(sequelize, Sequelize);
const UserLoyalty = require('../../models/user-loyalty')(sequelize, Sequelize);
const SendMail = require('../send-email/index');
BookingAddon.belongsTo(Addon, { as: 'addon' });
Room.belongsTo(BedType, { as: 'bedType' });
Room.hasMany(RoomImages, { as: 'roomImages' });
Room.belongsTo(RoomCategory, { as: 'roomCategory' });
Booking.hasMany(BookingRoom, { as: 'bookingRoom' });
BookingRoom.hasMany(BookingAddon,{as:'bookingAddon'});
BookingRoom.hasMany(BookingOffer,{as:'bookingOffer'});
Booking.belongsTo(BookingUser, { as: 'bookingUser' });
Booking.belongsTo(BookingStatus, { as: 'bookingStatus' });
Booking.belongsTo(BookingLoyalty, { as: 'bookingLoyalty' });
BookingLoyalty.belongsTo(Booking, { as: 'booking' });
BookingLoyalty.belongsTo(Loyalty, { as: 'loyalty' });
BookingLoyalty.belongsTo(User, { as: 'user' });
Booking.belongsTo(BookingPromoCode, { as: 'bookingPromoCode' });
Booking.belongsTo(BookingCard, { as: 'bookingCard' });
Booking.hasOne(BookingCancellation); 
Booking.belongsTo(Branch, { as: 'branch' });
BookingRoom.belongsTo(Room, { as: 'room' });
Booking.belongsTo(User, { as: 'user' });
BookingRoomDate.belongsTo(RoomDate, { as: 'roomDate' });
BookingRoomDate.belongsTo(Room, { as: 'room' });
Branch.hasMany(BranchImages, { as: 'branchImages' });
Booking.hasMany(BookingRoomDate, { as: 'bookingRoomDate' });
Booking.hasMany(UserLoyalty, { as: 'bookingUserLoyalty' });
UserLoyalty.belongsTo(User, { as: 'user' });



exports.cron = () => {
    Booking.findAll().then(bookings => {
        bookings.map(booking=>{
            if(booking.dataValues.checkOut == moment().format('YYYY-MM-DD') && booking.dataValues.bookingStatusId != 7){
                let userId =  booking.dataValues.userId;
                let amount = booking.dataValues.finalPrice;
                let bookingId = booking.dataValues.id;
                let today = moment().format('YYYY-MM-DD');
                Booking.update({
                    checkOutFinalPrice:amount,
                    bookingStatusId:7
                },{
                    where:{
                        id:bookingId
                    }
                }).then(bookingD => {
                    if(userId){
                        sequelize.query('select SUM(bookings.checkOutFinalPrice) as value from bookings where bookings.userId = :userId',
                            { replacements: {userId:userId },type: Sequelize.QueryTypes.SELECT}
                        ).then(checkOutFinalPriceSum => {
                            if(checkOutFinalPriceSum[0].value > 0){
                                Loyalty.findOne({
                                    attributes: ['id','minTotalBookingAmountPassLoyalty','oneQAREqualPoint','minTotalBookingAmountForUsing','minTotalBookingAmountToGetLoyalty','createdAt'],
                                    order:[['id', 'DESC'],]
                                }).then(loyalty => {
                                    if(amount >= loyalty.dataValues.minTotalBookingAmountToGetLoyalty){
                                        console.log("*****************");
                                        console.log(userId);
                                        console.log("*****************");
                                        if(checkOutFinalPriceSum[0].value >= loyalty.dataValues.minTotalBookingAmountPassLoyalty && ((checkOutFinalPriceSum[0].value - amount) < loyalty.dataValues.minTotalBookingAmountPassLoyalty)){
                                            UserLoyalty.create({
                                                point:(checkOutFinalPriceSum[0].value*loyalty.dataValues.oneQAREqualPoint),
                                                userId:userId,
                                                bookingId:bookingId
                                            }).then(userLoyalty => {
                                                sequelize.query('update users set users.availablePoint = :point where users.id = :userId',
                                                    { replacements: {point: parseInt(checkOutFinalPriceSum[0].value*loyalty.dataValues.oneQAREqualPoint),userId:userId }}
                                                ).then(roomDate => {
                                                    sequelize.query('update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId',
                                                        { replacements: {bookingId: bookingId,date:today }}
                                                    ).then(roomDate => {
                                                        checkOutMail(bookingId);
                                                    }, err => {
                                                        console.log(err);
                                                    });
                                                }, err => {
                                                    console.log(err);
                                                });
                                            }, err => {
                                                console.log(err);
                                            });
                                        }else if(checkOutFinalPriceSum[0].value > loyalty.dataValues.minTotalBookingAmountPassLoyalty && ((checkOutFinalPriceSum[0].value - amount) >= loyalty.dataValues.minTotalBookingAmountPassLoyalty)){
                                            UserLoyalty.create({
                                                point:(amount*loyalty.dataValues.oneQAREqualPoint),
                                                userId:userId,
                                                bookingId:bookingId
                                            }).then(userLoyalty => {
                                                sequelize.query('update users set users.availablePoint = users.availablePoint + :point where users.id = :userId',
                                                    { replacements: {point: checkOutFinalPriceSum[0].value*loyalty.dataValues.oneQAREqualPoint,userId:userId }}
                                                ).then(roomDate => {
                                                    sequelize.query('update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId',
                                                        { replacements: {bookingId: bookingId,date:today }}
                                                    ).then(roomDate => {
                                                        checkOutMail(bookingId);
                                                    }, err => {
                                                        console.log(err);
                                                    });
                                                }, err => {
                                                    console.log(err);
                                                });
                                            }, err => {
                                                console.log(err);
                                            });
                                        }else{
                                            sequelize.query('update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId',
                                                { replacements: {bookingId: bookingId,date:today }}
                                            ).then(roomDate => {
                                                checkOutMail(bookingId);
                                            }, err => {
                                                console.log(err);
                                            });
                                        }
                                    }else{
                                        sequelize.query('update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId',
                                            { replacements: {bookingId: bookingId,date:today }}
                                        ).then(roomDate => {
                                            checkOutMail(bookingId);
                                        }, err => {
                                            console.log(err);
                                        });
                                    }
                                }, err => {
                                    console.log(err);
                                });
                            }else{
                                sequelize.query('update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId',
                                    { replacements: {bookingId: bookingId,date:today }}
                                ).then(roomDate => {
                                    checkOutMail(bookingId);
                                }, err => {
                                    console.log(err);
                                });
                            }
                        }, err => {
                            console.log(err);
                        });
                    }else{
                        sequelize.query('update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId',
                            { replacements: {bookingId: bookingId,date:today }}
                        ).then(roomDate => {
                            checkOutMail(bookingId);
                        }, err => {
                            console.log(err);
                        });
                    }
                }, err => {
                    console.log(err);
                })
            }
        })
    }, err => {
        console.log(err);
    });
}
var checkOutMail = (bookingId) => {
    Booking.findOne({
        where:{
            id:bookingId
        },
        include: [
            {
                model: BookingUser, as: 'bookingUser'
            }
        ]
    }).then(booking => {
        if(booking.bookingUser){
            if(booking.bookingUser.dataValues.email){
                let content = `
                <div style="
                    border-radius: 20px;
                    border: 1px solid #e1e1e1d1;
                    padding: 50px;
                    margin-bottom: 60px;
                ">
                    <p><b>Dear ${booking.bookingUser.dataValues.fName},</p> 
                    <p>Thank you very much for Staying at our Hotel.</p>
    
                    <p>Kindly accept our heartiest gratitude for giving us the opportunity to serve you. We hold in high esteems the patronage, encouragement and support you had given to us.</p>
                    <p>We hope that you had a comfortable stay with us and would grow in strength in coming years.</p>                    
                    <p>It will be a great Privilege for us if you would revert with your feedback and suggestions, which will help us to make your next visit more comfortable and enjoyable.</p>
                    <p>We thank you once again and assure you of our Best Services at all times and hope you would give us the opportunity to serve you once again.</p>                    
                    <p>Please visit our website www.lavillahospitality.com</p>
    
                    <div style="text-align:center">
                        <h3>Please rate us</h3>
                        <a href="${env.appEndpoint}booking-detail/${booking.dataValues.id}/add-rating/1"><img style="width:50px;height:50px" src="${env.apiEndpoint}assets/images/rating1.png" /></a>
                        <a href="${env.appEndpoint}booking-detail/${booking.dataValues.id}/add-rating/2"><img style="width:50px;height:50px" src="${env.apiEndpoint}assets/images/rating2.png" /></a>
                        <a href="${env.appEndpoint}booking-detail/${booking.dataValues.id}/add-rating/3"><img style="width:50px;height:50px" src="${env.apiEndpoint}assets/images/rating3.png" /></a>
                        <a href="${env.appEndpoint}booking-detail/${booking.dataValues.id}/add-rating/4"><img style="width:50px;height:50px" src="${env.apiEndpoint}assets/images/rating4.png" /></a>
                        <a href="${env.appEndpoint}booking-detail/${booking.dataValues.id}/add-rating/5"><img style="width:50px;height:50px" src="${env.apiEndpoint}assets/images/rating5.png" /></a>
                    </div>
                </div>
                `
                SendMail.sendEmail(booking.bookingUser.dataValues.email, "Booking Checkout Completed", content).then(resMail => {
                    console.log({message:"Status Updated"});
                }, errMail => { 
                    console.log({ error: errMail });
                })
            }else{
                console.log({message:"Status Updated"});
            }
           
        }else{
            console.log({message:"Status Updated"});
        }
    }, err => {
        console.log({ message: "Booking Status update failed..!!!",err:err });
    }); 
};