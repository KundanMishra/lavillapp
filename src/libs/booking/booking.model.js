const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");
const _ = require("underscore");

const sequelize = require("../../configs/connection");
const env = require("../../configs/env");
const Booking = require("../../models/booking")(sequelize, Sequelize);
const BookingAddon = require("../../models/booking-addon")(
  sequelize,
  Sequelize
);
const BookingUser = require("../../models/booking-user")(sequelize, Sequelize);
const Addon = require("../../models/addon")(sequelize, Sequelize);
const User = require("../../models/user")(sequelize, Sequelize);
const Room = require("../../models/room")(sequelize, Sequelize);
const Branch = require("../../models/branch")(sequelize, Sequelize);
const BranchImages = require("../../models/branch-images")(
  sequelize,
  Sequelize
);
const BedType = require("../../models/bed-type")(sequelize, Sequelize);
const RoomCategory = require("../../models/room-category")(
  sequelize,
  Sequelize
);
const Country = require("../../models/country")(sequelize, Sequelize);
const BookingStatus = require("../../models/booking-status")(
  sequelize,
  Sequelize
);
const BookingCancellation = require("../../models/booking-cancellation")(
  sequelize,
  Sequelize
);
const BookingRoom = require("../../models/booking-room")(sequelize, Sequelize);
const BookingOffer = require("../../models/booking-offer")(
  sequelize,
  Sequelize
);
const RoomImages = require("../../models/room-images")(sequelize, Sequelize);
const BookingLoyalty = require("../../models/booking-loyalty")(
  sequelize,
  Sequelize
);
const BookingPromoCode = require("../../models/booking-promo-code")(
  sequelize,
  Sequelize
);
const BookingCard = require("../../models/booking-card")(sequelize, Sequelize);
const Loyalty = require("../../models/loyalty")(sequelize, Sequelize);
const RoomDate = require("../../models/room-date")(sequelize, Sequelize);
const BookingRoomDate = require("../../models/booking-room-date")(
  sequelize,
  Sequelize
);
const UserLoyalty = require("../../models/user-loyalty")(sequelize, Sequelize);
const SendMail = require("../send-email/index");
const room = require("../../models/room");
BookingAddon.belongsTo(Addon, { as: "addon" });
Room.belongsTo(BedType, { as: "bedType" });
Room.hasMany(RoomImages, { as: "roomImages" });
Room.belongsTo(RoomCategory, { as: "roomCategory" });
Booking.hasMany(BookingRoom, { as: "bookingRoom" });
BookingRoom.hasMany(BookingAddon, { as: "bookingAddon" });
BookingRoom.hasMany(BookingOffer, { as: "bookingOffer" });
Booking.belongsTo(BookingUser, { as: "bookingUser" });
Booking.belongsTo(BookingStatus, { as: "bookingStatus" });
Booking.belongsTo(BookingLoyalty, { as: "bookingLoyalty" });
BookingLoyalty.belongsTo(Booking, { as: "booking" });
BookingLoyalty.belongsTo(Loyalty, { as: "loyalty" });
BookingLoyalty.belongsTo(User, { as: "user" });
Booking.belongsTo(BookingPromoCode, { as: "bookingPromoCode" });
Booking.belongsTo(BookingCard, { as: "bookingCard" });
Booking.hasOne(BookingCancellation);
Booking.belongsTo(Branch, { as: "branch" });
BookingRoom.belongsTo(Room, { as: "room" });
Booking.belongsTo(User, { as: "user" });
BookingRoomDate.belongsTo(RoomDate, { as: "roomDate" });
BookingRoomDate.belongsTo(Room, { as: "room" });
Branch.hasMany(BranchImages, { as: "branchImages" });
Booking.hasMany(BookingRoomDate, { as: "bookingRoomDate" });
Booking.hasMany(UserLoyalty, { as: "bookingUserLoyalty" });
UserLoyalty.belongsTo(User, { as: "user" });
Booking.sync();
BookingRoom.sync();
BookingAddon.sync();
BookingOffer.sync();
BookingUser.sync();
BookingPromoCode.sync();
BookingCard.sync();
BookingLoyalty.sync();
BookingCancellation.sync();
BookingRoomDate.sync();

exports.createBookingBasic = (bookingData) => {
  console.log("booking data : ", bookingData);
  return new Promise((resolve, reject) => {
    Booking.create(bookingData, {
      include: [
        {
          model: BookingRoom,
          as: "bookingRoom",
          include: [
            { model: BookingAddon, as: "bookingAddon" },
            { model: BookingOffer, as: "bookingOffer" },
          ],
        },
      ],
    }).then(
      (booking) => {
        console.log("Booking obj ", booking);
        Branch.findByPk(bookingData.branchId).then(
          (branch) => {
            console.log("Branch details : ", branch);
            let str = branch.dataValues.name;
            let matches = str.match(/\b(\w)/g); // ['J','S','O','N']
            let acronym = matches.join("").toUpperCase(); // JSON
            let output = booking.dataValues.id + "";
            while (output.length < 5) {
              output = "0" + output;
            }
            // console.log(acronym)
            let displayID = acronym + moment().format("YYYYMMDD") + output;
            // console.log("displayid : ", displayID)
            Booking.update(
              { displayID: displayID },
              {
                where: {
                  id: booking.dataValues.id,
                },
              }
            ).then(
              (result) => {
                resolve(booking);
              },
              (err) => {
                reject({ error: err });
              }
            );
          },
          (err) => {
            reject({ error: err });
          }
        );
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.getBookingBasic = (bookinId) => {
  return new Promise((resolve, reject) => {
    Booking.findByPk(bookinId, {
      include: [
        {
          model: BookingRoom,
          as: "bookingRoom",
          include: [
            {
              model: BookingAddon,
              as: "bookingAddon",
              include: [
                {
                  attributes: ["id", "name", "nameAr"],
                  model: Addon,
                  as: "addon",
                },
              ],
            },
            { model: BookingOffer, as: "bookingOffer" },
            {
              model: Room,
              as: "room",
              include: [
                {
                  attributes: ["id", "name", "nameAr"],
                  model: RoomCategory,
                  as: "roomCategory",
                },
              ],
            },
          ],
        },
        {
          model: Branch,
          as: "branch",
          include: [
            {
              attributes: [
                "id",
                [
                  Sequelize.fn(
                    "CONCAT",
                    env.apiEndpoint,
                    Sequelize.col("path")
                  ),
                  "path",
                ],
              ],
              model: BranchImages,
              as: "branchImages",
            },
          ],
        },
      ],
    }).then(
      (booking) => {
        resolve(booking);
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.createBookingUser = (bookingData) => {
  return new Promise((resolve, reject) => {
    BookingUser.create(bookingData.bookingUser).then(
      (bookingUser) => {
        bookingData.bookingUserId = bookingUser.dataValues.id;
        Booking.update(bookingData, {
          where: {
            id: bookingData.id,
          },
        }).then(
          (booking1) => {
            Booking.findByPk(bookingData.id).then(
              (booking) => {
                resolve(booking);
              },
              (err) => {
                reject({ error: err });
              }
            );
          },
          (err) => {
            reject({ error: err });
          }
        );
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.getBookingUser = (bookingId) => {
  return new Promise((resolve, reject) => {
    Booking.findOne({
      where: {
        id: bookingId,
      },
      include: [
        {
          model: BookingRoom,
          as: "bookingRoom",
          include: [
            {
              model: BookingAddon,
              as: "bookingAddon",
              include: [
                {
                  attributes: ["id", "name", "nameAr"],
                  model: Addon,
                  as: "addon",
                },
              ],
            },
            { model: BookingOffer, as: "bookingOffer" },
            {
              model: Room,
              as: "room",
              include: [
                {
                  attributes: ["id", "name", "nameAr"],
                  model: RoomCategory,
                  as: "roomCategory",
                },
              ],
            },
          ],
        },
        {
          model: Branch,
          as: "branch",
          include: [
            {
              attributes: [
                "id",
                [
                  Sequelize.fn(
                    "CONCAT",
                    env.apiEndpoint,
                    Sequelize.col("path")
                  ),
                  "path",
                ],
              ],
              model: BranchImages,
              as: "branchImages",
            },
          ],
        },
        {
          model: BookingUser,
          as: "bookingUser",
        },
        {
          model: User,
          as: "user",
        },
      ],
    }).then(
      (booking) => {
        resolve(booking);
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.createBookingPromoCode = (bookingData) => {
  return new Promise((resolve, reject) => {
    BookingPromoCode.create(bookingData.bookingPromoCode).then(
      (bookingPromoCode) => {
        bookingData.bookingPromoCodeId = bookingPromoCode.dataValues.id;
        resolve(bookingData);
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.createBookingLoyalty = (bookingData) => {
  return new Promise((resolve, reject) => {
    BookingLoyalty.create(bookingData.bookingLoyalty).then(
      (bookingLoyalty) => {
        // console.log("bD",bookingData)

        bookingData.bookingLoyaltyId = bookingLoyalty.dataValues.id;
        // console.log("updating loyalty points", "point",bookingData.bookingLoyalty.usedPoint,"user id", bookingData.userId)

        sequelize
          .query(
            "UPDATE users SET availablePoint = availablePoint - :usedPoint where users.id = :userId",
            // sequelize.query('UPDATE users SET availablePoint = availablePoint - :usedPoint where users.id = :userId',
            {
              replacements: {
                usedPoint: bookingData.bookingLoyalty.usedPoint,
                userId: bookingData.user_id,
              },
            }
          )
          .then(
            (user) => {
              // console.log("inside used point",bookingData.bookingLoyalty.usedPoint, "user id", bookingData.userId)
              resolve(bookingData);
            },
            (err) => {
              reject({ message: "Booking update failed..!!!" });
            }
          );
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.createBookingCard = (bookingData) => {
  return new Promise((resolve, reject) => {
    BookingCard.create(bookingData.bookingCard).then(
      (bookingCard) => {
        bookingData.bookingCardId = bookingCard.dataValues.id;
        resolve(bookingData);
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.updateDateAvailability = (bookingData) => {
  return new Promise((resolve, reject) => {
    sequelize
      .query(
        "select room_dates.date,room_dates.id as roomDateId, room_dates.roomId,room_dates.bookedCount from room_dates where roomId in (SELECT booking_rooms.roomId FROM bookings JOIN booking_rooms on bookings.id = booking_rooms.bookingId where bookings.id = :bookingId ) and date BETWEEN ( SELECT bookings.checkIn from bookings where bookings.id = :bookingId) and DATE_SUB((SELECT bookings.checkOut from bookings  where bookings.id = :bookingId), INTERVAL 1 DAY)",
        {
          replacements: { bookingId: bookingData.id },
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then(
        (bookingRD) => {
          sequelize
            .query(
              "SELECT booking_rooms.BBATwoCount+booking_rooms.BBAOneCount+booking_rooms.ROAOneCount+booking_rooms.ROATwoCount as roomBookedCount, booking_rooms.roomId from bookings JOIN booking_rooms on bookings.id = booking_rooms.bookingId where bookings.id  = :bookingId",
              {
                replacements: { bookingId: bookingData.id },
                type: Sequelize.QueryTypes.SELECT,
              }
            )
            .then(
              (bookingRD1) => {
                let fData = [];
                let bookedCountRow = [];
                bookingRD.map((brd, i) => {
                  fData.push({
                    roomBookedCount: _.findWhere(bookingRD1, {
                      roomId: brd.roomId,
                    }).roomBookedCount,
                    roomDateId: brd.roomDateId,
                  });
                  bookedCountRow.push({
                    bookedCount: _.findWhere(bookingRD1, { roomId: brd.roomId })
                      .roomBookedCount,
                    roomDateId: brd.roomDateId,
                    roomId: brd.roomId,
                    bookingId: bookingData.id,
                  });
                });
                BookingRoomDate.bulkCreate(bookedCountRow).then(
                  (d) => {
                    let q = "update room_dates  SET bookedCount = CASE id ";
                    fData.map((d) => {
                      q =
                        q +
                        " WHEN " +
                        d.roomDateId +
                        " THEN bookedCount+" +
                        d.roomBookedCount;
                    });
                    q = q + " ELSE bookedCount END";
                    q =
                      q +
                      " WHERE id IN(" +
                      _.pluck(fData, "roomDateId").toString() +
                      ") ";
                    console.log(q);
                    sequelize.query(q).then(
                      (bookingRD1) => {
                        resolve(bookingData);
                      },
                      (err) => {
                        reject({ message: "Booking update failed..!!!" });
                      }
                    );
                  },
                  (err) => {
                    reject({ message: "Booking update failed..!!!" });
                  }
                );
              },
              (err) => {
                reject({ message: "Booking update failed..!!!" });
              }
            );
        },
        (err) => {
          reject({ message: "Booking update failed..!!!" });
        }
      );
  });
};
exports.finalBooking = (bookingData) => {
  return new Promise((resolve, reject) => {
    Booking.update(bookingData, {
      where: {
        id: bookingData.id,
      },
    }).then(
      (booking1) => {
        Booking.findByPk(bookingData.id, {
          include: [
            {
              model: Branch,
              as: "branch",
              include: [{ model: BranchImages, as: "branchImages" }],
            },
            { model: Branch, as: "branch" },
            {
              model: BookingRoom,
              as: "bookingRoom",
              include: [
                { model: Room, as: "room" },
                {
                  model: BookingAddon,
                  as: "bookingAddon",
                  include: [
                    {
                      attributes: ["id", "name", "nameAr"],
                      model: Addon,
                      as: "addon",
                    },
                  ],
                },
              ],
            },
            { model: BookingUser, as: "bookingUser" },
          ],
        }).then(
          (booking) => {
            let BBAOneCount = 0,
              BBATwoCount = 0,
              ROAOneCount = 0,
              ROATwoCount = 0;
            for (var i = 0; i < booking.bookingRoom.length; i++) {
              BBAOneCount = BBAOneCount + booking.bookingRoom[i].BBAOneCount;
              BBATwoCount = BBATwoCount + booking.bookingRoom[i].BBATwoCount;
              ROAOneCount = ROAOneCount + booking.bookingRoom[i].ROAOneCount;
              ROATwoCount = ROATwoCount + booking.bookingRoom[i].ROATwoCount;
            }
            // console.log("Counts", BBAOneCount, BBATwoCount, ROAOneCount, ROATwoCount)
            let roomDetails = "";

            for (var i = 0; i < booking.bookingRoom.length; i++) {
              roomDetails =
                roomDetails +
                `<span>
                        <h4>Room Type : ${
                          booking.bookingRoom[i].room.description
                        }</h4>
                            <ol>                            
                            ${
                              booking.bookingRoom[i].BBAOneCount > 0
                                ? "<li>Room with breakfast for single person x " +
                                  booking.bookingRoom[i].BBAOneCount +
                                  "</li>"
                                : ""
                            }
                                ${
                                  booking.bookingRoom[i].BBATwoCount > 0
                                    ? "<li> Room with breakfast for double person x " +
                                      booking.bookingRoom[i].BBATwoCount +
                                      "</li>"
                                    : ""
                                }
                                    ${
                                      booking.bookingRoom[i].ROAOneCount > 0
                                        ? "<li>Room only for single person x " +
                                          booking.bookingRoom[i].ROAOneCount +
                                          "</li>"
                                        : ""
                                    }
                                        ${
                                          booking.bookingRoom[i].ROATwoCount > 0
                                            ? "<li>Room only for double person x " +
                                              booking.bookingRoom[i]
                                                .ROATwoCount +
                                              "</li>"
                                            : ""
                                        }
                                        ${booking.bookingRoom[
                                          i
                                        ].bookingAddon.map(
                                          (item) =>
                                            "<li>" +
                                            item.addon.name +
                                            // + "-" + item.price
                                            " x " +
                                            item.count +
                                            "</li>"
                                        )}
                            </ol>
                        </span >
                        
                 
                 `;
            }

            // https://maps.googleapis.com/maps/api/staticmap?center=25.37299,51.38103&zoom=11&size=800x400&markers=color:0x83232F%7Clabel:L%7C25.3729934003908,51.38103422244467&key=AIzaSyD99D_NY4eOM9ZYs5ea5jl59K9Xi3Dp_dg
            let content = `
                <div style=" border-radius: 20px; border: 1px solid #e1e1e1d1; padding: 20px; margin-bottom: 60px; ">
                <p><b>Dear ${booking.bookingUser.fName} ${
              booking.bookingUser.lName
            },</b></p>
                <p>Thank you for choosing to stay at our Hotel, The team at La Villa Hotel looks forward to extending our gracious hospitality to you!  Should you require further assistance, please call +974 4432 2795 or click here to modify your reservation</p>
                <table>
                
                </tr>
                <tr style="width:100%">
                  <td style="width:10%;padding-bottom:10px;">
                  <img src="${
                    env.apiEndpoint +
                    booking.branch.branchImages[0].dataValues.path
                  }" width="150"/>
                  </td>
                  <td style="width:45%;border-right:1px solid #832231;padding-left:10px;padding-bottom:10px;">
                  	<b>${booking.branch.dataValues.name}</b> (${
              booking.branch.dataValues.nameAr
            })<br/>
                    <b>Address</b>: ${booking.branch.dataValues.address}<br/>
                    ${booking.branch.dataValues.addressAr}<br/>
                    <b>Phone</b>: +974 4432 2795<br/>
                    <b>GPS coordinates</b>: ${booking.branch.dataValues.lat},${
              booking.branch.dataValues.lng
            }
                  </td>
                  <td style="width:10%;text-align:center;border-right:1px solid #832231;padding-bottom:10px;">
                    CHECK-IN<br/>
                    <b style="font-size:30px">${moment(
                      booking.dataValues.checkIn,
                      "YYYY-MM-DD"
                    ).format("DD")}</b><br/>
                    <b style="font-size:20px">${moment(
                      booking.dataValues.checkIn,
                      "YYYY-MM-DD"
                    ).format("MMMM")}</b><br/>
                    <span style="font-style: italic;">${moment(
                      booking.dataValues.checkIn,
                      "YYYY-MM-DD"
                    ).format("dddd")}</span><br/>
                    12:00 - 14:00
                  </td>
                  <td style="width:10%;text-align:center;border-right:1px solid #832231;padding-bottom:10px;">
                    CHECK-OUT<br/>
                    <b style="font-size:30px">${moment(
                      booking.dataValues.checkOut,
                      "YYYY-MM-DD"
                    ).format("DD")}</b><br/>
                    <b style="font-size:20px">${moment(
                      booking.dataValues.checkOut,
                      "YYYY-MM-DD"
                    ).format("MMMM")}</b><br/>
                    <span style="font-style: italic;">${moment(
                      booking.dataValues.checkOut,
                      "YYYY-MM-DD"
                    ).format("dddd")}</span><br/>
                    12:00 - 13:00

                  </td>
                <td style="width:25%;text-align:center;padding-left:10px;padding-bottom:10px;vertical-align: text-top;">
                ROOMS/NIGHT<br/>
                <b style="font-size:40px">
                ${
                  _.map(booking.bookingRoom, function (bookingRoom) {
                    return bookingRoom.dataValues.BBAOneCount;
                  }).reduce((s, f) => {
                    return s + f;
                  }, 0) +
                  _.map(booking.dataValues.bookingRoom, function (bookingRoom) {
                    return bookingRoom.dataValues.BBATwoCount;
                  }).reduce((s, f) => {
                    return s + f;
                  }, 0) +
                  _.map(booking.dataValues.bookingRoom, function (bookingRoom) {
                    return bookingRoom.dataValues.ROAOneCount;
                  }).reduce((s, f) => {
                    return s + f;
                  }, 0) +
                  _.map(booking.dataValues.bookingRoom, function (bookingRoom) {
                    return bookingRoom.dataValues.ROATwoCount;
                  }).reduce((s, f) => {
                    return s + f;
                  }, 0)
                } / ${moment(booking.dataValues.checkOut, "YYYY-MM-DD").diff(
              moment(booking.dataValues.checkIn, "YYYY-MM-DD"),
              "days"
            )}
                </b> <br/>
                <br/>
                </td>
                  </td >
                 </tr >
                 <tr>
                 	<td colspan="5" style="border-top:1px solid #832231;padding-bottom:10px;"></td>
                 </tr>
                 <tr>
                 	<td colspan="3" style="padding-bottom:10px;"><b style="font-size:20px">Booking ID</b></td>
                    <td colspan="2" style="padding-bottom:10px;text-align:right"><b style="font-size:20px">${
                      booking.dataValues.displayID
                    }</b></td>
                 </tr>
                 ${
                   bookingData.bookingLoyalty &&
                   `<tr>
                  
                 <td colspan="3" style="padding-bottom:10px;"><b style="font-size:20px">Loyalty applied (${
                   bookingData.bookingLoyalty.usedPoint
                 } points)</b></td>
                 <td colspan="2" style="padding-bottom:10px;text-align:right"><b style="font-size:20px; color: 'red'">QAR -${
                   bookingData.bookingLoyalty.usedPoint *
                     (1 / bookingData.bookingLoyalty.loyaltyValue) >
                   bookingData.totalWithoutLoyalty
                     ? bookingData.totalWithoutLoyalty
                     : bookingData.bookingLoyalty.usedPoint *
                       (1 / bookingData.bookingLoyalty.loyaltyValue)
                 }</b></td>
                </tr>`
                 }
                 <tr>
                 	<td colspan="3" style="padding-bottom:10px;"><b style="font-size:20px">Price</b></td>
                    <td colspan="2" style="padding-bottom:10px;text-align:right"><b style="font-size:20px">QAR ${
                      booking.dataValues.finalPrice
                    }</b></td>
                 </tr>
                 <tr tyle="width:100%">
                    <td colspan="5" style="padding-bottom:10px;padding-top:10px; border-bottom:1px">
                    <b style="font-size:20px"><u>Booking summary</u></b>
                    ${roomDetails}
                </td>
                 <tr>
                     <td colspan="5" style="padding-bottom:10px;padding-top:10px;">
                     <hr/>
                    	<b>The final price shown is the amount you will pay to the property.</b><br/><br/>
                        <b>Payment information</b><br/>
                        <p>La Villa Hotel handles all payments.</p>
                        <p>This property accepts the following forms of payment: American Express, Visa, Mastercard</p>
                        <b>Additional information</b>
                        <p>Please note that additional supplements (e.g. extra bed) are not added in this total.</p>
                        <p>If you don't show up or cancel, applicable taxes may still be charged by the property.</p>
                        <p>Please remember to read the <b>Important information</b> below, as this may contain important details not mentioned here.</p>
                    </td>
                 </tr>
                 <tr>
                 	<td colspan="5" style="border-top:1px solid #832231;padding-bottom:20px;"></td>
                 </tr>
                 <tr>
                 	<td colspan="5" style="padding-bottom:10px;text-align: center;">
                     <a target="_blank" href="https://www.google.com/maps/?q=${
                       booking.branch.dataValues.lat
                     },${
              booking.branch.dataValues.lng
            }"><img style="height: 250px;width: auto;" src="https://maps.googleapis.com/maps/api/staticmap?center=25.37299,51.38103&zoom=11&size=800x400&markers=color:0x83232F%7Clabel:L%7C${
              booking.branch.dataValues.lat
            },${
              booking.branch.dataValues.lng
            }&key=AIzaSyD99D_NY4eOM9ZYs5ea5jl59K9Xi3Dp_dg" width="150"/></a>
                    </td>
                 </tr>
                 <tr>
                 	<td colspan="5" style="border-top:1px solid #832231;padding-bottom:10px;"></td>
                 </tr>
                 <tr>
                 	<td colspan="5">
                    	<b>Important information</b>
                        <p>Some nationalities can get an entry permit stamped in their passport upon arrival at the airport. Please check your visa requirements
                            before travelling. The hotel can arrange a visa for you after making your reservation, please contact the hotel directly using the contact details
provided in your confirmation email.</p>
						<p>Please let La Villa Hotel know in advance if you would like to use the airport shuttle. You can use the Special Requests box when booking or contact the property.</p>
                        <p>Please be advised that couples checking in to the same room must present a marriage certificate upon check-in as per Qatari law.</p>
						<b>Hotel Policies </b><br/><br/>
                        <b>Guest parking</b><br/><br/>
                        <li>Free public parking is possible at a location nearby (reservation is not needed).</li><br/> 
						<b>Internet</b><br/><br/>
						<li>WiFi is available in all areas and is free of charge.</li><br/>
                        <b>You can always view, change or cancel your booking online</b>
                        <p>For any questions related to the property, you can contact La Villa Hotel directly on: +974 4432 2795</p>
                        <b>Or contact us by phone - we're available 24 hours a day:</b>
                        <p>Customer service information </p>
                        <p>Phone: 44376613</p>
                        <p>Mobile: 33181375</p>
                        <p>Email: online@lavillahospitality.com</p>
						<p>This print version of your confirmation contains the most important information about your booking. It can be used to check in when you arrive at La Villa Hotel. For further details please refer to your confirmation email sent
to rm@lavillahospitality.com.</p>
                    </td>
                 </tr>
                </table >
                </div >
                    `;

            // Room details previous code starts -----

            //     <td style="width:15%;text-align:center;padding-left:10px;padding-bottom:10px;vertical-align: text-top;">
            //     ROOMS/NIGHT- RO<br/>
            //     <b style="font-size:30px">
            //     ${_.map(booking.bookingRoom, function (bookingRoom) { return bookingRoom.dataValues.BBAOneCount; }).reduce((s, f) => {
            //     return s + f;
            // }, 0) + _.map(booking.dataValues.bookingRoom, function (bookingRoom) { return bookingRoom.dataValues.BBATwoCount; }).reduce((s, f) => {
            //     return s + f;
            // }, 0) + _.map(booking.dataValues.bookingRoom, function (bookingRoom) { return bookingRoom.dataValues.ROAOneCount; }).reduce((s, f) => {
            //     return s + f;
            // }, 0) + _.map(booking.dataValues.bookingRoom, function (bookingRoom) { return bookingRoom.dataValues.ROATwoCount; }).reduce((s, f) => {
            //     return s + f;
            // }, 0)} / ${moment(booking.dataValues.checkOut, 'YYYY-MM-DD').diff(moment(booking.dataValues.checkIn, 'YYYY-MM-DD'), 'days')}
            //     </b>

            //   </td>

            //room details previous code ends

            SendMail.sendEmail(
              booking.bookingUser.dataValues.email,
              `Hi ${booking.bookingUser.fName}, Your Booking is Confirmed`,
              content
            ).then(
              (resMail) => {
                resolve(booking);
              },
              (errMail) => {
                console.log("mail error occured", errMail);
                // reject({ error: errMail });
                resolve(booking);
              }
            );
          },
          (err) => {
            reject({ error: err });
          }
        );
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.removeBookingRoomAddonAndOffer = (bookingData) => {
  return new Promise((resolve, reject) => {
    sequelize
      .query(
        "UPDATE  room_dates JOIN booking_room_dates on booking_room_dates.roomDateId = room_dates.id join  bookings on bookings.id = booking_room_dates.bookingId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where bookings.id = :bookingId and bookings.userId = :userId",
        {
          replacements: {
            userId: bookingData.userId,
            bookingId: bookingData.id,
          },
        }
      )
      .then(
        (bookingRD) => {
          sequelize
            .query(
              "delete from booking_addons where bookingRoomId in (select id from booking_rooms where bookingId = :bookingId)",
              { replacements: { bookingId: bookingData.id } }
            )
            .then(
              (bookingRD) => {
                sequelize
                  .query(
                    "delete from booking_offers where bookingRoomId in (select id from booking_rooms where bookingId = :bookingId)",
                    { replacements: { bookingId: bookingData.id } }
                  )
                  .then(
                    (bookingRD) => {
                      sequelize
                        .query(
                          "delete from booking_room_dates where bookingId = :bookingId",
                          { replacements: { bookingId: bookingData.id } }
                        )
                        .then(
                          (bookingRD) => {
                            sequelize
                              .query(
                                "delete from booking_rooms where bookingId = :bookingId",
                                { replacements: { bookingId: bookingData.id } }
                              )
                              .then(
                                (bookingRD) => {
                                  resolve(bookingData);
                                },
                                (err) => {
                                  reject({
                                    message: "Booking update failed..!!!",
                                  });
                                }
                              );
                          },
                          (err) => {
                            reject({ message: "Booking update failed..!!!" });
                          }
                        );
                    },
                    (err) => {
                      reject({ message: "Booking update failed..!!!" });
                    }
                  );
              },
              (err) => {
                reject({ message: "Booking update failed..!!!" });
              }
            );
        },
        (err) => {
          reject({ message: "Booking update failed..!!!" });
        }
      );
  });
};
exports.addBookingRoom = (bookingData) => {
  return new Promise((resolve, reject) => {
    BookingRoom.bulkCreate(bookingData.bookingRoom, {
      include: [
        { model: BookingAddon, as: "bookingAddon" },
        { model: BookingOffer, as: "bookingOffer" },
      ],
    }).then(
      (booking) => {
        resolve(bookingData);
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.bookingAuthCheck = (body) => {
  return new Promise((resolve, reject) => {
    Booking.findOne({
      where: {
        displayID: body.id,
      },
      attributes: ["id"],
      include: [
        {
          model: BookingUser,
          as: "bookingUser",
          where: {
            email: body.email,
          },
        },
      ],
    }).then(
      (booking) => {
        resolve(booking);
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.getBookingByIdEmail = (body) => {
  return new Promise((resolve, reject) => {
    Booking.findOne({
      where: {
        displayID: body.id,
      },
      include: [
        {
          model: BookingRoom,
          as: "bookingRoom",
          include: [
            {
              model: BookingAddon,
              as: "bookingAddon",
              include: [
                {
                  attributes: ["id", "name", "nameAr"],
                  model: Addon,
                  as: "addon",
                },
              ],
            },
            { model: BookingOffer, as: "bookingOffer" },
            {
              model: Room,
              as: "room",
              include: [
                {
                  attributes: ["id", "name", "nameAr"],
                  model: RoomCategory,
                  as: "roomCategory",
                },
                {
                  attributes: ["id", "name", "nameAr"],
                  model: BedType,
                  as: "bedType",
                },
              ],
            },
          ],
        },
        {
          model: Branch,
          as: "branch",
          include: [
            {
              attributes: [
                "id",
                [
                  Sequelize.fn(
                    "CONCAT",
                    env.apiEndpoint,
                    Sequelize.col("path")
                  ),
                  "path",
                ],
              ],
              model: BranchImages,
              as: "branchImages",
            },
          ],
        },
        {
          model: BookingUser,
          as: "bookingUser",
          where: {
            email: body.email,
          },
        },
        {
          model: User,
          as: "user",
        },
        {
          model: BookingPromoCode,
          as: "bookingPromoCode",
        },
        {
          model: BookingLoyalty,
          as: "bookingLoyalty",
        },
        {
          model: BookingCard,
          as: "bookingCard",
        },
        {
          model: BookingStatus,
          as: "bookingStatus",
        },
        {
          model: BookingCancellation,
        },
      ],
    }).then(
      (booking) => {
        resolve(booking);
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.updateBookingDateAvailability = (bookingData) => {
  return new Promise((resolve, reject) => {
    sequelize
      .query(
        "select room_dates.date,room_dates.id as roomDateId, room_dates.roomId,room_dates.bookedCount from room_dates where roomId in (SELECT booking_rooms.roomId FROM bookings JOIN booking_rooms on bookings.id = booking_rooms.bookingId where bookings.id = :bookingId ) and date BETWEEN ( SELECT bookings.checkIn from bookings where bookings.id = :bookingId) and DATE_SUB((SELECT bookings.checkOut from bookings  where bookings.id = :bookingId), INTERVAL 1 DAY)",
        {
          replacements: { bookingId: bookingData.id },
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then(
        (bookingRD) => {
          sequelize
            .query(
              "SELECT booking_rooms.BBATwoCount+booking_rooms.BBAOneCount+booking_rooms.ROAOneCount+booking_rooms.ROATwoCount as roomBookedCount, booking_rooms.roomId from bookings JOIN booking_rooms on bookings.id = booking_rooms.bookingId where bookings.id  = :bookingId",
              {
                replacements: { bookingId: bookingData.id },
                type: Sequelize.QueryTypes.SELECT,
              }
            )
            .then(
              (bookingRD1) => {
                let fData = [];
                let bookedCountRow = [];
                bookingRD.map((brd, i) => {
                  fData.push({
                    roomBookedCount: _.findWhere(bookingRD1, {
                      roomId: brd.roomId,
                    }).roomBookedCount,
                    roomDateId: brd.roomDateId,
                  });
                  bookedCountRow.push({
                    bookedCount: _.findWhere(bookingRD1, { roomId: brd.roomId })
                      .roomBookedCount,
                    roomDateId: brd.roomDateId,
                    roomId: brd.roomId,
                    bookingId: bookingData.id,
                  });
                });
                BookingRoomDate.bulkCreate(bookedCountRow).then(
                  (d) => {
                    let q = "update room_dates  SET bookedCount = CASE id ";
                    fData.map((d) => {
                      q =
                        q +
                        " WHEN " +
                        d.roomDateId +
                        " THEN bookedCount+" +
                        d.roomBookedCount;
                    });
                    q = q + " ELSE bookedCount END";
                    q =
                      q +
                      " WHERE id IN(" +
                      _.pluck(fData, "roomDateId").toString() +
                      ") ";
                    console.log(q);
                    sequelize.query(q).then(
                      ((bookingRD1) => {
                        resolve(bookingData);
                      },
                      (err) => {
                        reject({ message: "Booking update failed..!!!" });
                      })
                    );
                  },
                  (err) => {
                    reject({ message: "Booking update failed..!!!" });
                  }
                );
              },
              (err) => {
                reject({ message: "Booking update failed..!!!" });
              }
            );
        },
        (err) => {
          reject({ message: "Booking update failed..!!!" });
        }
      );
  });
};
exports.updateBookingBasic = (bookingData) => {
  return new Promise((resolve, reject) => {
    Booking.update(bookingData, {
      where: {
        id: bookingData.id,
      },
    }).then(
      (booking) => {
        resolve(bookingData);
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};

exports.createBooking = (bookingData) => {
  return new Promise((resolve, reject) => {
    Booking.create(bookingData, {
      include: [
        { model: BookingAddon, as: "bookingAddon" },
        { model: BookingUser, as: "bookingUser" },
      ],
    }).then(
      (booking) => {
        let dateAvailabiltiy = [];
        console.log(booking.dataValues);
        for (
          let m = moment(booking.dataValues.checkIn, "YYYY-MM-DD");
          m.diff(
            moment(booking.dataValues.checkOut, "YYYY-MM-DD").subtract(
              1,
              "days"
            ),
            "days"
          ) <= 0;
          m.add(1, "days")
        ) {
          dateAvailabiltiy.push(m.format("YYYY-MM-DD"));
        }
        sequelize
          .query(
            "UPDATE room_dates SET roomStatusId = 2,bookingId=:bookingId WHERE date IN (:dateAvailabiltiy) AND roomId = :roomId",
            {
              replacements: {
                dateAvailabiltiy: dateAvailabiltiy,
                roomId: booking.dataValues.roomId,
                bookingId: booking.dataValues.id,
              },
            }
          )
          .then(
            (bookingRD) => {
              console.log("****************************");
              console.log(bookingRD);
              console.log("****************************");
              resolve(booking);
            },
            (err) => {
              reject({ message: "Booking update failed..!!!" });
            }
          );
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.editBooking = (body, id) => {
  return new Promise((resolve, reject) => {
    Booking.update(body, {
      where: {
        id: id,
      },
    }).then(
      (booking) => {
        console.log(booking);
        if (booking.length == 0) {
          reject({ message: "Booking update failed..!!!" });
        } else {
          resolve({ message: "Booking updated..!!!" });
        }
      },
      (err) => {
        reject({ message: "Booking update failed..!!!" });
      }
    );
  });
};
exports.getBooking = (bookingId) => {
  return new Promise((resolve, reject) => {
    Booking.findOne({
      where: {
        id: bookingId,
      },
      include: [
        {
          model: BookingRoom,
          as: "bookingRoom",
          include: [
            {
              model: BookingAddon,
              as: "bookingAddon",
              include: [
                {
                  attributes: ["id", "name", "nameAr"],
                  model: Addon,
                  as: "addon",
                },
              ],
            },
            { model: BookingOffer, as: "bookingOffer" },
            {
              model: Room,
              as: "room",
              include: [
                {
                  attributes: ["id", "name", "nameAr"],
                  model: RoomCategory,
                  as: "roomCategory",
                },
                {
                  attributes: ["id", "name", "nameAr"],
                  model: BedType,
                  as: "bedType",
                },
              ],
            },
          ],
        },
        {
          model: Branch,
          as: "branch",
          include: [
            {
              attributes: [
                "id",
                [
                  Sequelize.fn(
                    "CONCAT",
                    env.apiEndpoint,
                    Sequelize.col("path")
                  ),
                  "path",
                ],
              ],
              model: BranchImages,
              as: "branchImages",
            },
          ],
        },
        {
          model: BookingUser,
          as: "bookingUser",
        },
        {
          model: User,
          as: "user",
        },
        {
          model: BookingPromoCode,
          as: "bookingPromoCode",
        },
        {
          model: BookingLoyalty,
          as: "bookingLoyalty",
        },
        {
          model: BookingCard,
          as: "bookingCard",
        },
        {
          model: BookingStatus,
          as: "bookingStatus",
        },
        {
          model: BookingCancellation,
        },
      ],
    }).then(
      (booking) => {
        resolve(booking);
      },
      (err) => {
        reject({ error: err });
      }
    );
  });
};
exports.findAllBooking = (body) => {
  return new Promise((resolve, reject) => {
    let page = (body.start + body.length) / body.length;
    let attributes = [];
    body.columns.map((c) => {
      attributes.push(c.data);
    });
    let orderC = attributes[body.order[0].column];
    let orderD = body.order[0].dir;
    const options = {
      attributes: attributes,
      page: page,
      paginate: body.length,
      order: [[orderC, orderD]],
      where: { name: { [Op.like]: `% ${body.search.value}% ` } },
    };
    Booking.paginate(options).then(
      (res) => {
        let response = {
          draw: body.draw,
          recordsTotal: res.total,
          recordsFiltered: res.total,
          data: res.docs,
        };
        resolve(response);
      },
      (err) => {
        reject({ message: "Booking get failed..!!!" });
      }
    );
  });
};
exports.listAllBooking = () => {
  return new Promise((resolve, reject) => {
    Booking.findAll({
      attributes: ["id", "name", "featured"],
    }).then(
      (res) => {
        resolve(res);
      },
      (err) => {
        reject({ message: "Booking get failed..!!!" });
      }
    );
  });
};
exports.deleteBooking = (bookingId) => {
  return new Promise((resolve, reject) => {
    Booking.destroy({
      where: {
        id: bookingId,
      },
    }).then(
      (booking) => {
        console.log(booking);
        if (booking == 0) {
          reject({ message: "Booking delete failed..!!!" });
        } else {
          resolve({ message: "Booking deleted..!!!" });
        }
      },
      (err) => {
        reject({ message: "Booking delete failed..!!!" });
      }
    );
  });
};
exports.getAllBooking = (body) => {
  return new Promise((resolve, reject) => {
    let query = "";
    let query1 = "";
    query += `
                select
                bookings.id as bookingId,
                    checkIn,
                    DATE_FORMAT(bookings.checkOut, '%d-%m-%Y') as checkOut,
                    bookings.finalPrice,
                    DATE_FORMAT(bookings.createdAt, '%d-%m-%Y') as createdAt,
                    booking_users.fName,
                    booking_statuses.name as status,
                    GROUP_CONCAT(room_categories.name) as roomCategories,
                    bookings.id
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join booking_statuses on bookings.bookingStatusId = booking_statuses.id
                left outer join booking_rooms on bookings.id = booking_rooms.bookingId
                left outer join rooms on booking_rooms.roomId = rooms.id
                left outer join room_categories on rooms.roomCategoryId = room_categories.id
                left outer join branches on bookings.branchId = branches.id`;
    query1 += `
                select
                count(bookings.id) as count
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join branches on bookings.branchId = branches.id`;

    if (body.status) {
      console.log(body, "bodybody");
      switch (body.status) {
        case "completed":
          query += ` where
                bookings.bookingStatusId = 3`;
          query1 += ` where
                bookings.bookingStatusId = 3`;
          break;
        case "upcoming":
          query += ` where
                bookings.bookingStatusId = 3 and
                checkIn > '${moment().format("YYYY-MM-DD")}'`;
          query1 += ` where
                bookings.bookingStatusId = 3 and
                checkIn > '${moment().format("YYYY-MM-DD")}'`;
          break;
        case "cancelled":
          query += ` where
                bookings.bookingStatusId = 4`;
          query1 += ` where
                bookings.bookingStatusId = 4`;
          break;
        case "no-show":
          query += ` where
                bookings.bookingStatusId = 5`;
          query1 += ` where
                bookings.bookingStatusId = 5`;
          break;
        case "invalid":
          query += ` where
                bookings.bookingStatusId = 6`;
          query1 += ` where
                bookings.bookingStatusId = 6`;
          break;
        case "user-detail-pending":
          query += ` where
                bookings.bookingStatusId = 1`;
          query1 += ` where
                bookings.bookingStatusId = 1`;
          break;
        case "payment-pending":
          query += ` where
                bookings.bookingStatusId = 2`;
          query1 += ` where
                bookings.bookingStatusId = 2`;
          break;
        case "checkout":
          query += ` where
                bookings.bookingStatusId = 7`;
          query1 += ` where
                bookings.bookingStatusId = 7`;
          break;
        default:
          query += ` `;
          query1 += ` `;
          break;
      }
    }
    if (body.fName) {
      query += " and booking_users.fName  LIKE '%" + body.fName + "%'";
      query1 += " and booking_users.fName  LIKE '%" + body.fName + "%'";
    }
    if (body.checkIn && body.checkIn.from !== "" && body.checkIn.to !== "") {
      if (!body.status) {
        query += " where checkIn >= '" + body.checkIn.from + "'";
        query += " and checkIn <= '" + body.checkIn.to + "'";
      } else {
        query += " and checkIn >= '" + body.checkIn.from + "'";
        query += " and checkIn <= '" + body.checkIn.to + "'";
      }
    }

    if (body.branch) {
      query += " and branches.id = " + body.branch;
      query1 += " and branches.id = " + body.branch;
    }
    if (body.booking) {
      query += " and bookings.id = " + body.booking;
      query1 += " and bookings.id = " + body.booking;
    }
    query += " GROUP by bookings.id ORDER by bookings.id DESC";
    // query1 += ' GROUP by bookings.id';
    query += " limit " + body.start + "," + body.length;
    console.log(query, "lsdfjksjdf", query1);
    sequelize.query(query, { type: Sequelize.QueryTypes.SELECT }).then(
      (bookingRD) => {
        sequelize.query(query1, { type: Sequelize.QueryTypes.SELECT }).then(
          (bookingRD1) => {
            let response = {
              draw: body.draw,
              recordsTotal: bookingRD1[0] ? bookingRD1[0].count : 0,
              recordsFiltered: bookingRD1[0] ? bookingRD1[0].count : 0,
              data: bookingRD,
            };
            resolve(response);
          },
          (err) => {
            reject({ message: "Booking Fetch failed..!!!", err: err });
          }
        );
      },
      (err) => {
        reject({ message: "Booking Fetch failed..!!!", err: err });
      }
    );
  });
};
exports.getAllCompletedBooking = (body) => {
  return new Promise((resolve, reject) => {
    let query = "";
    let query1 = "";
    query += `
                select
                bookings.id as bookingId,
                    DATE_FORMAT(bookings.checkIn, '%d-%m-%Y') as checkIn,
                    DATE_FORMAT(bookings.checkOut, '%d-%m-%Y') as checkOut,
                    bookings.finalPrice,
                    DATE_FORMAT(bookings.createdAt, '%d-%m-%Y') as createdAt,
                    booking_users.fName,
                    booking_statuses.name as status,
                    GROUP_CONCAT(room_categories.name) as roomCategories,
                    bookings.id
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join booking_statuses on bookings.bookingStatusId = booking_statuses.id
                left outer join booking_rooms on bookings.id = booking_rooms.bookingId
                left outer join rooms on booking_rooms.roomId = rooms.id
                left outer join room_categories on rooms.roomCategoryId = room_categories.id
                left outer join branches on bookings.branchId = branches.id
                where
                bookings.bookingStatusId IN(3, 7) and
                checkIn >= '${moment().format("YYYY-MM-DD")}'`;
    query1 += `
                select
                count(bookings.id) as count
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join booking_statuses on bookings.bookingStatusId = booking_statuses.id
                left outer join booking_rooms on bookings.id = booking_rooms.bookingId
                left outer join rooms on booking_rooms.roomId = rooms.id
                left outer join room_categories on rooms.roomCategoryId = room_categories.id
                left outer join branches on bookings.branchId = branches.id
                where
                bookings.bookingStatusId IN(3, 7) and
                checkIn >= '${moment().format("YYYY-MM-DD")}'`;
    if (body.fName) {
      query += " and booking_users.fName  LIKE '%" + body.fName + "%'";
      query1 += " and booking_users.fName  LIKE '%" + body.fName + "%'";
    }
    if (body.checkIn) {
      query += " and checkIn = '" + body.checkIn + "'";
      query1 += " and checkIn = '" + body.checkIn + "'";
    }
    if (body.branch) {
      query += " and branches.id = " + body.branch;
      query1 += " and branches.id = " + body.branch;
    }
    if (body.booking) {
      query += " and bookings.id = " + body.booking;
      query1 += " and bookings.id = " + body.booking;
    }
    query += " GROUP by bookings.id";
    query1 += " GROUP by bookings.id";
    query += " limit " + body.start + "," + body.length;

    sequelize.query(query, { type: Sequelize.QueryTypes.SELECT }).then(
      (bookingRD) => {
        sequelize.query(query1, { type: Sequelize.QueryTypes.SELECT }).then(
          (bookingRD1) => {
            let response = {
              draw: body.draw,
              recordsTotal: bookingRD1[0] ? bookingRD1[0].count : 0,
              recordsFiltered: bookingRD1[0] ? bookingRD1[0].count : 0,
              data: bookingRD,
            };
            resolve(response);
          },
          (err) => {
            reject({ message: "Booking Fetch failed..!!!", err: err });
          }
        );
      },
      (err) => {
        reject({ message: "Booking Fetch failed..!!!", err: err });
      }
    );
  });
};
exports.getAllUpcomingBooking = (body) => {
  return new Promise((resolve, reject) => {
    let query = "";
    let query1 = "";
    query += `
                select
                bookings.id as bookingId,
                    DATE_FORMAT(bookings.checkIn, '%d-%m-%Y') as checkIn,
                    DATE_FORMAT(bookings.checkOut, '%d-%m-%Y') as checkOut,
                    bookings.finalPrice,
                    DATE_FORMAT(bookings.createdAt, '%d-%m-%Y') as createdAt,
                    booking_users.fName,
                    booking_statuses.name as status,
                    GROUP_CONCAT(room_categories.name) as roomCategories,
                    bookings.id
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join booking_statuses on bookings.bookingStatusId = booking_statuses.id
                left outer join booking_rooms on bookings.id = booking_rooms.bookingId
                left outer join rooms on booking_rooms.roomId = rooms.id
                left outer join room_categories on rooms.roomCategoryId = room_categories.id
                left outer join branches on bookings.branchId = branches.id
                where
                bookings.bookingStatusId = 3 and
                checkOut > '${moment().format("YYYY-MM-DD")}'`;
    query1 += `
                select
                count(bookings.id) as count
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join booking_statuses on bookings.bookingStatusId = booking_statuses.id
                left outer join booking_rooms on bookings.id = booking_rooms.bookingId
                left outer join rooms on booking_rooms.roomId = rooms.id
                left outer join room_categories on rooms.roomCategoryId = room_categories.id
                left outer join branches on bookings.branchId = branches.id
                where
                bookings.bookingStatusId = 3 and
                checkOut > '${moment().format("YYYY-MM-DD")}'`;
    if (body.fName) {
      query += " and booking_users.fName  LIKE '%" + body.fName + "%'";
      query1 += " and booking_users.fName  LIKE '%" + body.fName + "%'";
    }
    if (body.checkIn) {
      query += " and checkIn = '" + body.checkIn + "'";
      query1 += " and checkIn = '" + body.checkIn + "'";
    }
    if (body.branch) {
      query += " and branches.id = " + body.branch;
      query1 += " and branches.id = " + body.branch;
    }
    if (body.booking) {
      query += " and bookings.id = " + body.booking;
      query1 += " and bookings.id = " + body.booking;
    }
    query += " GROUP by bookings.id";
    query1 += " GROUP by bookings.id";
    query += " limit " + body.start + "," + body.length;

    sequelize.query(query, { type: Sequelize.QueryTypes.SELECT }).then(
      (bookingRD) => {
        sequelize.query(query1, { type: Sequelize.QueryTypes.SELECT }).then(
          (bookingRD1) => {
            let response = {
              draw: body.draw,
              recordsTotal: bookingRD1[0] ? bookingRD1[0].count : 0,
              recordsFiltered: bookingRD1[0] ? bookingRD1[0].count : 0,
              data: bookingRD,
            };
            resolve(response);
          },
          (err) => {
            reject({ message: "Booking Fetch failed..!!!", err: err });
          }
        );
      },
      (err) => {
        reject({ message: "Booking Fetch failed..!!!", err: err });
      }
    );
  });
};
exports.getAllCancelledBooking = (body) => {
  return new Promise((resolve, reject) => {
    let query = "";
    let query1 = "";
    query += `
                select
                bookings.id as bookingId,
                    DATE_FORMAT(bookings.checkIn, '%d-%m-%Y') as checkIn,
                    DATE_FORMAT(bookings.checkOut, '%d-%m-%Y') as checkOut,
                    bookings.finalPrice,
                    DATE_FORMAT(bookings.createdAt, '%d-%m-%Y') as createdAt,
                    booking_users.fName,
                    booking_statuses.name as status,
                    GROUP_CONCAT(room_categories.name) as roomCategories,
                    bookings.id
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join booking_statuses on bookings.bookingStatusId = booking_statuses.id
                left outer join booking_rooms on bookings.id = booking_rooms.bookingId
                left outer join rooms on booking_rooms.roomId = rooms.id
                left outer join room_categories on rooms.roomCategoryId = room_categories.id
                left outer join branches on bookings.branchId = branches.id
                where
                bookings.bookingStatusId = 4`;
    query1 += `
                select
                count(bookings.id) as count
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join booking_statuses on bookings.bookingStatusId = booking_statuses.id
                left outer join booking_rooms on bookings.id = booking_rooms.bookingId
                left outer join rooms on booking_rooms.roomId = rooms.id
                left outer join room_categories on rooms.roomCategoryId = room_categories.id
                left outer join branches on bookings.branchId = branches.id
                where
                bookings.bookingStatusId = 4`;
    if (body.fName) {
      query += " and booking_users.fName  LIKE '%" + body.fName + "%'";
      query1 += " and booking_users.fName  LIKE '%" + body.fName + "%'";
    }
    if (body.checkIn) {
      query += " and checkIn = '" + body.checkIn + "'";
      query1 += " and checkIn = '" + body.checkIn + "'";
    }
    if (body.checkOut) {
      query += " and checkOut = '" + body.checkOut + "'";
      query1 += " and checkOut = '" + body.checkOut + "'";
    }
    if (body.branch) {
      query += " and branches.id = " + body.branch;
      query1 += " and branches.id = " + body.branch;
    }
    if (body.booking) {
      query += " and bookings.id = " + body.booking;
      query1 += " and bookings.id = " + body.booking;
    }
    query += " GROUP by bookings.id";
    query1 += " GROUP by bookings.id";
    query += " limit " + body.start + "," + body.length;

    sequelize.query(query, { type: Sequelize.QueryTypes.SELECT }).then(
      (bookingRD) => {
        sequelize.query(query1, { type: Sequelize.QueryTypes.SELECT }).then(
          (bookingRD1) => {
            let response = {
              draw: body.draw,
              recordsTotal: bookingRD1[0] ? bookingRD1[0].count : 0,
              recordsFiltered: bookingRD1[0] ? bookingRD1[0].count : 0,
              data: bookingRD,
            };
            resolve(response);
          },
          (err) => {
            reject({ message: "Booking Fetch failed..!!!", err: err });
          }
        );
      },
      (err) => {
        reject({ message: "Booking Fetch failed..!!!", err: err });
      }
    );
  });
};
exports.getAllNoShowBooking = (body) => {
  return new Promise((resolve, reject) => {
    let query = "";
    let query1 = "";
    query += `
                select
                bookings.id as bookingId,
                    DATE_FORMAT(bookings.checkIn, '%d-%m-%Y') as checkIn,
                    DATE_FORMAT(bookings.checkOut, '%d-%m-%Y') as checkOut,
                    bookings.finalPrice,
                    DATE_FORMAT(bookings.createdAt, '%d-%m-%Y') as createdAt,
                    booking_users.fName,
                    booking_statuses.name as status,
                    GROUP_CONCAT(room_categories.name) as roomCategories,
                    bookings.id
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join booking_statuses on bookings.bookingStatusId = booking_statuses.id
                left outer join booking_rooms on bookings.id = booking_rooms.bookingId
                left outer join rooms on booking_rooms.roomId = rooms.id
                left outer join room_categories on rooms.roomCategoryId = room_categories.id
                left outer join branches on bookings.branchId = branches.id
                where
                bookings.bookingStatusId = 5`;
    query1 += `
                select
                count(bookings.id) as count
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join booking_statuses on bookings.bookingStatusId = booking_statuses.id
                left outer join booking_rooms on bookings.id = booking_rooms.bookingId
                left outer join rooms on booking_rooms.roomId = rooms.id
                left outer join room_categories on rooms.roomCategoryId = room_categories.id
                left outer join branches on bookings.branchId = branches.id
                where
                bookings.bookingStatusId = 5`;
    if (body.fName) {
      query += " and booking_users.fName  LIKE '%" + body.fName + "%'";
      query1 += " and booking_users.fName  LIKE '%" + body.fName + "%'";
    }
    if (body.checkIn) {
      query += " and checkIn = '" + body.checkIn + "'";
      query1 += " and checkIn = '" + body.checkIn + "'";
    }
    if (body.checkOut) {
      query += " and checkOut = '" + body.checkOut + "'";
      query1 += " and checkOut = '" + body.checkOut + "'";
    }
    if (body.branch) {
      query += " and branches.id = " + body.branch;
      query1 += " and branches.id = " + body.branch;
    }
    if (body.booking) {
      query += " and bookings.id = " + body.booking;
      query1 += " and bookings.id = " + body.booking;
    }
    query += " GROUP by bookings.id";
    query1 += " GROUP by bookings.id";
    query += " limit " + body.start + "," + body.length;

    sequelize.query(query, { type: Sequelize.QueryTypes.SELECT }).then(
      (bookingRD) => {
        sequelize.query(query1, { type: Sequelize.QueryTypes.SELECT }).then(
          (bookingRD1) => {
            let response = {
              draw: body.draw,
              recordsTotal: bookingRD1[0] ? bookingRD1[0].count : 0,
              recordsFiltered: bookingRD1[0] ? bookingRD1[0].count : 0,
              data: bookingRD,
            };
            resolve(response);
          },
          (err) => {
            reject({ message: "Booking Fetch failed..!!!", err: err });
          }
        );
      },
      (err) => {
        reject({ message: "Booking Fetch failed..!!!", err: err });
      }
    );
  });
};
exports.getAllInvalidBooking = (body) => {
  return new Promise((resolve, reject) => {
    let query = "";
    let query1 = "";
    query += `
                select
                bookings.id as bookingId,
                    DATE_FORMAT(bookings.checkIn, '%d-%m-%Y') as checkIn,
                    DATE_FORMAT(bookings.checkOut, '%d-%m-%Y') as checkOut,
                    bookings.finalPrice,
                    DATE_FORMAT(bookings.createdAt, '%d-%m-%Y') as createdAt,
                    booking_users.fName,
                    booking_statuses.name as status,
                    GROUP_CONCAT(room_categories.name) as roomCategories,
                    bookings.id
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join booking_statuses on bookings.bookingStatusId = booking_statuses.id
                left outer join booking_rooms on bookings.id = booking_rooms.bookingId
                left outer join rooms on booking_rooms.roomId = rooms.id
                left outer join room_categories on rooms.roomCategoryId = room_categories.id
                left outer join branches on bookings.branchId = branches.id
                where
                bookings.bookingStatusId = 6`;
    query1 += `
                select
                count(bookings.id) as count
                from bookings
                left outer join booking_users on bookings.bookingUserId = booking_users.id
                left outer join booking_statuses on bookings.bookingStatusId = booking_statuses.id
                left outer join booking_rooms on bookings.id = booking_rooms.bookingId
                left outer join rooms on booking_rooms.roomId = rooms.id
                left outer join room_categories on rooms.roomCategoryId = room_categories.id
                left outer join branches on bookings.branchId = branches.id
                where
                bookings.bookingStatusId = 6`;
    if (body.fName) {
      query += " and booking_users.fName  LIKE '%" + body.fName + "%'";
      query1 += " and booking_users.fName  LIKE '%" + body.fName + "%'";
    }
    if (body.checkIn) {
      query += " and checkIn = '" + body.checkIn + "'";
      query1 += " and checkIn = '" + body.checkIn + "'";
    }
    if (body.checkOut) {
      query += " and checkOut = '" + body.checkOut + "'";
      query1 += " and checkOut = '" + body.checkOut + "'";
    }
    if (body.branch) {
      query += " and branches.id = " + body.branch;
      query1 += " and branches.id = " + body.branch;
    }
    if (body.booking) {
      query += " and bookings.id = " + body.booking;
      query1 += " and bookings.id = " + body.booking;
    }
    query += " GROUP by bookings.id";
    query1 += " GROUP by bookings.id";
    query += " limit " + body.start + "," + body.length;

    sequelize.query(query, { type: Sequelize.QueryTypes.SELECT }).then(
      (bookingRD) => {
        sequelize.query(query1, { type: Sequelize.QueryTypes.SELECT }).then(
          (bookingRD1) => {
            let response = {
              draw: body.draw,
              recordsTotal: bookingRD1[0] ? bookingRD1[0].count : 0,
              recordsFiltered: bookingRD1[0] ? bookingRD1[0].count : 0,
              data: bookingRD,
            };
            resolve(response);
          },
          (err) => {
            reject({ message: "Booking Fetch failed..!!!", err: err });
          }
        );
      },
      (err) => {
        reject({ message: "Booking Fetch failed..!!!", err: err });
      }
    );
  });
};
exports.cancelBooking = (body, userId) => {
  console.log("body", body);
  return new Promise((resolve, reject) => {
    let with_user_query =
      "UPDATE  room_dates JOIN booking_room_dates on booking_room_dates.roomDateId = room_dates.id join  bookings on bookings.id = booking_room_dates.bookingId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount, bookings.bookingStatusId = 4  where bookings.id = :bookingId and bookings.userId = :userId";
    let with_out_user_query =
      "UPDATE  room_dates JOIN booking_room_dates on booking_room_dates.roomDateId = room_dates.id join  bookings on bookings.id = booking_room_dates.bookingId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount, bookings.bookingStatusId = 4  where bookings.id = :bookingId";

    sequelize
      .query(userId ? with_user_query : with_out_user_query, {
        replacements: { userId: userId, bookingId: body.bookingId },
      })
      .then(
        (bookingRD) => {
          // console.log('bookingRd',bookingRD)
          BookingCancellation.create(body).then(
            (res) => {
              // console.log("res",res)
              // resolve(res);
              // console.log("body", body)
              // console.log("booking cancellation", bookingRD)
              // let emailArray = []
              // emailArray.push(body.data.user.email)
              // if(body.data.user.email != body.data.bookingUser.email) {
              //     emailArray.push(body.data.bookingUser.email)
              // }
              // console.log(emailArray)

              let content = ``;
              if (body.cancelledBy == "user") {
                content = ` <div style="border-radius: 20px;border: 1px solid #e1e1e1d1 ;padding: 50px;margin-bottom: 60px;">
                    <p><b>Dear ${body.data.bookingUser.fName},</p> 
                        <p>You have cancelled your booking ${
                          body.note && "due to " + body.note
                        } </p>
                         <p>For booking-related questions, contact La Villa Hotel directly:</p>
                        
                        <p>Property phone: +97444322795</p>
                        <p>Email the property : online@lavillahospitality.com</p>
                        <div style="text-align:center">
                            <a href="https://lavillahospitality.com/" style="
                                text-align: center;
                                vertical-align: middle;
                                border: 1px solid #9e0047;   
                                border-radius: .375rem; 
                                padding: .5rem .5rem;  
                                color: #fff;
                                background-color: #9e0047; 
                                box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08);
                                cursor: pointer;
                                text-decoration:none
                            ">Lavilla</a>
                        </div>
                    </div >
                    `;
              } else {
                content = ` <div style="border-radius: 20px;border: 1px solid #e1e1e1d1 ;padding: 50px;margin-bottom: 60px;">
                    <p><b>Dear ${body.data.bookingUser.fName},</p> 
                        <p>La Villa Hotel cancelled your booking ${
                          body.note && "due to " + body.note
                        } </p>
                        
                        <p>For booking-related questions, contact La Villa Hotel directly:</p>
                        
                        <p>Property phone: +97444322795</p>
                        <p>Email the property : online@lavillahospitality.com</p>
                        <div style="text-align:center">
                            <a href="https://lavillahospitality.com/" style="
                                text-align: center;
                                vertical-align: middle;
                                border: 1px solid #9e0047;   
                                border-radius: .375rem; 
                                padding: .5rem .5rem;  
                                color: #fff;
                                background-color: #9e0047; 
                                box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08);
                                cursor: pointer;
                                text-decoration:none
                            ">Lavilla</a>
                        </div>
                    </div >
                    `;
              }

              SendMail.sendEmail(
                body.data.bookingUser.email,
                `Hi ${body.data.bookingUser.fName}, Your Booking is Cancelled`,
                content
              ).then(
                (resMail) => {
                  console.log("resMail : ", resMail);
                  console.log(
                    "emal : ",
                    body.data.bookingUser.email,
                    `Hi ${body.data.bookingUser.fName}, Your Booking is Cancelled`
                  );

                  resolve(res);
                },
                (errMail) => {
                  // console.log("mail error cancel", errMail)
                  resolve(res);
                  // reject({ error: errMail });
                }
              );

              // ....
            },
            (err) => {
              reject({
                message: "Booking Cancellation Create failed..!!!",
                err: err,
              });
            }
          );
        },
        (err) => {
          reject({ message: "Booking Cancellation failed..!!!" });
        }
      );
  });
};
exports.confirmBookingEmail = (bookingId, userId) => {
  return new Promise((resolve, reject) => {
    Booking.update(
      {
        userId: userId,
      },
      {
        where: {
          id: bookingId,
        },
      }
    ).then(
      (bookingRD) => {
        resolve({ message: "Booking Updated" });
      },
      (err) => {
        reject({ message: "Booking Cancellation failed..!!!" });
      }
    );
  });
};
exports.validateBookingUser = (body, userId) => {
  return new Promise((resolve, reject) => {
    Booking.findOne({
      id: body.bookingId,
    }).then(
      (booking) => {
        resolve(booking);
      },
      (err) => {
        reject({ message: "Booking Cancellation failed..!!!" });
      }
    );
  });
};
exports.updateCard = (body) => {
  return new Promise((resolve, reject) => {
    BookingCard.update(body, {
      where: {
        id: body.bookingCardId,
      },
    }).then(
      (bookingCard) => {
        resolve({ message: "Card Details Updated" });
      },
      (err) => {
        reject({ message: "Booking Cancellation failed..!!!" });
      }
    );
  });
};
exports.getUpcomingBooking = (userId) => {
  console.log(userId);
  return new Promise((resolve, reject) => {
    Booking.findAll({
      where: {
        checkOut: {
          [Op.gt]: moment().format("YYYY-MM-DD"),
        },
        bookingStatusId: 3,
        userId: userId,
      },
      include: [
        {
          model: Branch,
          as: "branch",
          include: [
            {
              attributes: [
                "id",
                [
                  Sequelize.fn(
                    "CONCAT",
                    env.apiEndpoint,
                    Sequelize.col("path")
                  ),
                  "path",
                ],
              ],
              model: BranchImages,
              as: "branchImages",
            },
          ],
        },
        {
          model: BookingUser,
          as: "bookingUser",
        },
        {
          model: User,
          as: "user",
        },
      ],
    }).then(
      (booking) => {
        resolve(booking);
      },
      (err) => {
        reject({ message: "Booking get failed..!!!", err: err });
      }
    );
  });
};
exports.getCompletedBooking = (userId) => {
  console.log(userId);
  return new Promise((resolve, reject) => {
    Booking.findAll({
      where: {
        checkIn: {
          [Op.lte]: moment().format("YYYY-MM-DD"),
        },
        bookingStatusId: {
          [Op.in]: [3, 7],
        },
        userId: userId,
      },
      include: [
        {
          model: Branch,
          as: "branch",
          include: [
            {
              attributes: [
                "id",
                [
                  Sequelize.fn(
                    "CONCAT",
                    env.apiEndpoint,
                    Sequelize.col("path")
                  ),
                  "path",
                ],
              ],
              model: BranchImages,
              as: "branchImages",
            },
          ],
        },
        {
          model: BookingUser,
          as: "bookingUser",
        },
        {
          model: User,
          as: "user",
        },
      ],
    }).then(
      (booking) => {
        resolve(booking);
      },
      (err) => {
        reject({ message: "Booking get failed..!!!", err: err });
      }
    );
  });
};
exports.getCancelledBooking = (userId) => {
  console.log(userId);
  return new Promise((resolve, reject) => {
    Booking.findAll({
      where: {
        bookingStatusId: 4,
        userId: userId,
      },
      include: [
        {
          model: Branch,
          as: "branch",
          include: [
            {
              attributes: [
                "id",
                [
                  Sequelize.fn(
                    "CONCAT",
                    env.apiEndpoint,
                    Sequelize.col("path")
                  ),
                  "path",
                ],
              ],
              model: BranchImages,
              as: "branchImages",
            },
          ],
        },
        {
          model: BookingUser,
          as: "bookingUser",
        },
        {
          model: User,
          as: "user",
        },
      ],
    }).then(
      (booking) => {
        resolve(booking);
      },
      (err) => {
        reject({ message: "Booking get failed..!!!", err: err });
      }
    );
  });
};
exports.checkOut = (body) => {
  return new Promise((resolve, reject) => {
    Booking.findByPk(body.bookingId).then(
      (booking) => {
        let userId = booking.dataValues.userId;
        if (
          moment(booking.dataValues.checkIn, "YYYY-MM-DD") <
          moment(body.date, "YYYY-MM-DD")
        ) {
          let amount = body.amount;
          Booking.update(
            {
              checkOutFinalPrice: amount,
              bookingStatusId: 7,
            },
            {
              where: {
                id: body.bookingId,
              },
            }
          ).then(
            (bookingD) => {
              if (userId) {
                sequelize
                  .query(
                    "select SUM(bookings.checkOutFinalPrice) as value from bookings where bookings.userId = :userId",
                    {
                      replacements: { userId: userId },
                      type: Sequelize.QueryTypes.SELECT,
                    }
                  )
                  .then(
                    (checkOutFinalPriceSum) => {
                      if (checkOutFinalPriceSum[0].value > 0) {
                        Loyalty.findOne({
                          attributes: [
                            "id",
                            "minTotalBookingAmountPassLoyalty",
                            "oneQAREqualPoint",
                            "minTotalBookingAmountForUsing",
                            "minTotalBookingAmountToGetLoyalty",
                            "createdAt",
                          ],
                          order: [["id", "DESC"]],
                        }).then(
                          (loyalty) => {
                            if (
                              amount >=
                              loyalty.dataValues
                                .minTotalBookingAmountToGetLoyalty
                            ) {
                              console.log("*****************");
                              console.log(userId);
                              console.log("*****************");

                              if (
                                checkOutFinalPriceSum[0].value >=
                                  loyalty.dataValues
                                    .minTotalBookingAmountPassLoyalty &&
                                checkOutFinalPriceSum[0].value - amount <
                                  loyalty.dataValues
                                    .minTotalBookingAmountPassLoyalty
                              ) {
                                UserLoyalty.create({
                                  point:
                                    checkOutFinalPriceSum[0].value *
                                    loyalty.dataValues.oneQAREqualPoint,
                                  userId: userId,
                                  bookingId: body.bookingId,
                                }).then(
                                  (userLoyalty) => {
                                    sequelize
                                      .query(
                                        "update users set users.availablePoint = :point where users.id = :userId",
                                        {
                                          replacements: {
                                            point: parseInt(
                                              checkOutFinalPriceSum[0].value *
                                                loyalty.dataValues
                                                  .oneQAREqualPoint
                                            ),
                                            userId: userId,
                                          },
                                        }
                                      )
                                      .then(
                                        (roomDate) => {
                                          sequelize
                                            .query(
                                              "update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId",
                                              {
                                                replacements: {
                                                  bookingId: body.bookingId,
                                                  date: body.date,
                                                },
                                              }
                                            )
                                            .then(
                                              (roomDate) => {
                                                resolve(body);
                                              },
                                              (err) => {
                                                reject({
                                                  message: "update failed..!!!",
                                                });
                                              }
                                            );
                                        },
                                        (err) => {
                                          reject({
                                            message: "update failed..!!!",
                                          });
                                        }
                                      );
                                  },
                                  (err) => {
                                    reject({
                                      message: "Loyalty update failed..!!!",
                                    });
                                  }
                                );
                              } else if (
                                checkOutFinalPriceSum[0].value >
                                  loyalty.dataValues
                                    .minTotalBookingAmountPassLoyalty &&
                                checkOutFinalPriceSum[0].value - amount >=
                                  loyalty.dataValues
                                    .minTotalBookingAmountPassLoyalty
                              ) {
                                UserLoyalty.create({
                                  point:
                                    amount *
                                    loyalty.dataValues.oneQAREqualPoint,
                                  userId: userId,
                                  bookingId: body.bookingId,
                                }).then(
                                  (userLoyalty) => {
                                    sequelize
                                      .query(
                                        "update users set users.availablePoint = users.availablePoint + :point where users.id = :userId",
                                        {
                                          replacements: {
                                            point:
                                              checkOutFinalPriceSum[0].value *
                                              loyalty.dataValues
                                                .oneQAREqualPoint,
                                            userId: userId,
                                          },
                                        }
                                      )
                                      .then(
                                        (roomDate) => {
                                          sequelize
                                            .query(
                                              "update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId",
                                              {
                                                replacements: {
                                                  bookingId: body.bookingId,
                                                  date: body.date,
                                                },
                                              }
                                            )
                                            .then(
                                              (roomDate) => {
                                                resolve(body);
                                              },
                                              (err) => {
                                                reject({
                                                  message: "update failed..!!!",
                                                });
                                              }
                                            );
                                        },
                                        (err) => {
                                          reject({
                                            message: "update failed..!!!",
                                          });
                                        }
                                      );
                                  },
                                  (err) => {
                                    reject({
                                      message: "Loyalty update failed..!!!",
                                    });
                                  }
                                );
                              } else {
                                sequelize
                                  .query(
                                    "update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId",
                                    {
                                      replacements: {
                                        bookingId: body.bookingId,
                                        date: body.date,
                                      },
                                    }
                                  )
                                  .then(
                                    (roomDate) => {
                                      resolve(body);
                                    },
                                    (err) => {
                                      reject({ message: "update failed..!!!" });
                                    }
                                  );
                              }
                            } else {
                              sequelize
                                .query(
                                  "update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId",
                                  {
                                    replacements: {
                                      bookingId: body.bookingId,
                                      date: body.date,
                                    },
                                  }
                                )
                                .then(
                                  (roomDate) => {
                                    resolve(body);
                                  },
                                  (err) => {
                                    reject({ message: "update failed..!!!" });
                                  }
                                );
                            }
                          },
                          (err) => {
                            reject({ message: "Loyalty update failed..!!!" });
                          }
                        );
                      } else {
                        sequelize
                          .query(
                            "update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId",
                            {
                              replacements: {
                                bookingId: body.bookingId,
                                date: body.date,
                              },
                            }
                          )
                          .then(
                            (roomDate) => {
                              resolve(body);
                            },
                            (err) => {
                              reject({ message: "update failed..!!!" });
                            }
                          );
                      }
                    },
                    (err) => {
                      reject({ message: "Booking checkout failed..!!!" });
                    }
                  );
              } else {
                sequelize
                  .query(
                    "update room_dates left outer join booking_room_dates on room_dates.id = booking_room_dates.roomDateId set room_dates.bookedCount = room_dates.bookedCount - booking_room_dates.bookedCount where room_dates.id in (SELECT roomDateId FROM booking_room_dates WHERE bookingId = :bookingId)  and date > :date and booking_room_dates.bookingId = :bookingId",
                    {
                      replacements: {
                        bookingId: body.bookingId,
                        date: body.date,
                      },
                    }
                  )
                  .then(
                    (roomDate) => {
                      resolve(body);
                    },
                    (err) => {
                      reject({ message: "update failed..!!!" });
                    }
                  );
              }
            },
            (err) => {
              reject({ message: "Booking get failed..!!!", err: err });
            }
          );
        } else {
          reject({ message: "Booking checkout failed..!!!" });
        }
      },
      (err) => {
        reject({ message: "Booking checkout failed..!!!" });
      }
    );
  });
};
exports.checkOutMail = (body) => {
  return new Promise((resolve, reject) => {
    Booking.findOne({
      where: {
        id: body.bookingId,
      },
      include: [
        {
          model: BookingUser,
          as: "bookingUser",
        },
      ],
    }).then(
      (booking) => {
        if (booking.bookingUser.dataValues.email) {
          let content = `
                    < div style = "
                border - radius: 20px;
                border: 1px solid #e1e1e1d1;
                padding: 50px;
                margin - bottom: 60px;
                ">
                    < p ><b>Dear ${booking.bookingUser.dataValues.fName} ${booking.bookingUser.dataValues.lName},</p> 
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
                </div >
                    `;
          SendMail.sendEmail(
            booking.bookingUser.dataValues.email,
            "Booking Checkout Completed",
            content
          ).then(
            (resMail) => {
              resolve({ message: "Status Updated" });
            },
            (errMail) => {
              resolve({ message: "Status Updated" });
              // reject({ error: errMail });
            }
          );
        } else {
          resolve({ message: "Status Updated" });
        }
      },
      (err) => {
        reject({ message: "Booking Status update failed..!!!", err: err });
      }
    );
  });
};
exports.moveToNoShow = (bookingId, cancellationAmount) => {
  return new Promise((resolve, reject) => {
    Booking.update(
      {
        bookingStatusId: 5,
        cancellationAmount: cancellationAmount,
      },
      {
        where: {
          id: bookingId,
        },
      }
    ).then(
      (res) => {
        resolve({ message: "Status Updated" });
      },
      (err) => {
        reject({ message: "Booking Status update failed..!!!", err: err });
      }
    );
  });
};
exports.moveToNoShowMail = (bookingId) => {
  return new Promise((resolve, reject) => {
    Booking.findOne({
      where: {
        id: bookingId,
      },
      include: [
        {
          model: BookingUser,
          as: "bookingUser",
        },
        {
          model: Branch,
          as: "branch",
        },
      ],
    }).then(
      (booking) => {
        if (booking.bookingUser.dataValues.email) {
          let bookingIdNumber = booking.dataValues.id + "";
          while (bookingIdNumber.length < 5) {
            bookingIdNumber = "0" + bookingIdNumber;
          }
          let content = `
                    < div style = "
                border - radius: 20px;
                border: 1px solid #e1e1e1d1;
                padding: 50px;
                margin - bottom: 60px;
                ">
                    < p ><b>Dear ${booking.bookingUser.dataValues.fName},</p> 
                    <p>We are very sorry you were unable to stay at our Hotel on ${booking.branch.dataValues.name}. We missed serving you. As is always the case on a confirmed reservation, we held your accommodations for arrival as indicated by your reservation confirmation</p>
                    <table style="border:1px solid #83232f;padding:15px; width:100%">
                    	<tr>
                        	<td>Booking number</td>
                            <td style="text-align:right;">${bookingIdNumber}</td>
                        </tr>
                    	<tr>
                        	<td>E-mail</td>
                            <td style="text-align:right;">${booking.bookingUser.dataValues.email}</td>
                        </tr>
                    	<tr>
                        	<td style="padding-bottom:10px;">Booked by</td>
                            <td style="padding-bottom:10px;text-align:right;">${booking.bookingUser.dataValues.fName}</td>
                        </tr>
                    	<tr>
                        	<td style="border-top:1px solid #83232f;padding-top:10px;">Check-in</td>
                            <td style="border-top:1px solid #83232f;padding-top:10px;text-align:right;">${booking.dataValues.checkIn}</td>
                        </tr>
                    	<tr>
                        	<td style="padding-bottom:10px;">Check-out</td>
                            <td style="padding-bottom:10px;text-align:right;">${booking.dataValues.checkOut}</td>
                        </tr>
                    	<tr>
                        	<td style="border-top:1px solid #83232f;padding-top:10px;padding-bottom:10px;">Total cancellation cost</td>
                            <td style="border-top:1px solid #83232f;padding-top:10px;padding-bottom:10px;text-align:right;">QAR ${booking.dataValues.cancellationAmount}</td>
                        </tr>
                    	<tr>
                        	<td style="border-top:1px solid #83232f;padding-top:10px;">Customer Service information</td>
                            <td style="border-top:1px solid #83232f;padding-top:10px;"></td>
                        </tr>
                    	<tr>
                        	<td>Phone </td>
                            <td style="text-align:right;">44376613</td>
                        </tr>
                    	<tr>
                        	<td>Mobile</td>
                            <td style="text-align:right;">33181375</td>
                        </tr>
                    	<tr>
                        	<td>email</td>
                            <td style="text-align:right;">online@lavillahospitality.com</td>
                        </tr>
                    </table>
                    <p>As per the No Show policy, we were required to charge a one-night stay amounting to QAR ${booking.dataValues.cancellationAmount} to your (insert credit card type).</p>
<p>We certainly appreciate your choosing Our Hotel and once again hope you did not have any travel difficulties.</p>
<p>you are a valued guest of La Villa and we look forward to being a part of your future travel needs.</p>

<p>Sincerely</p>

                </div >
                    `;
          SendMail.sendEmail(
            booking.bookingUser.dataValues.email,
            "Booking Change to No Show",
            content
          ).then(
            (resMail) => {
              resolve({ message: "Status Updated" });
            },
            (errMail) => {
              // reject({ error: errMail });
              resolve({ message: "Status Updated" });
            }
          );
        } else {
          resolve({ message: "Status Updated" });
        }
      },
      (err) => {
        reject({ message: "Booking Status update failed..!!!", err: err });
      }
    );
  });
};
exports.markAsInvalid = (bookingId) => {
  return new Promise((resolve, reject) => {
    Booking.update(
      {
        bookingStatusId: 6,
        cardUpdateNeeded: 1,
        cardUpdateDate: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id: bookingId,
        },
      }
    ).then(
      (res) => {
        Booking.findOne({
          where: {
            id: bookingId,
          },
          include: [
            {
              model: BookingUser,
              as: "bookingUser",
            },
            {
              model: BookingCard,
              as: "bookingCard",
            },
          ],
        }).then(
          (booking) => {
            console.log();
            if (booking.bookingUser.dataValues.email) {
              let content = `
                    <div style ="border-radius: 20px;border: 1px solid #e1e1e1d1;padding: 50px;margin-bottom: 60px">
                    <p><b>Dear ${booking.bookingUser.dataValues.fName},</p> 
                        <p>La Villa Hotel declined your credit card ending in xxxxxxxxxxxx${String(
                          booking.bookingCard.dataValues.creditCard
                        ).substring(
                          String(booking.bookingCard.dataValues.creditCard)
                            .length - 3
                        )} because your card number is invalid. You may have entered the numbers incorrectly in our system. </p>
                        <p>To secure this reservation, pay for the entire booking now or update your credit card details within the next 2 hours.</p>
                        <p>For payment-related questions, contact La Villa Hotel directly:</p>
                        
                        <p>Property phone: +97444322795</p>
                        <p>Email the property : online@lavillahospitality.com</p>
                        <div style="text-align:center">
                            <a href="${env.appEndpoint}booking-detail/${
                booking.dataValues.id
              }/update-card" style="
                                text-align: center;
                                vertical-align: middle;
                                border: 1px solid #9e0047;   
                                border-radius: .375rem; 
                                padding: .5rem .5rem;  
                                color: #fff;
                                background-color: #9e0047; 
                                box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08);
                                cursor: pointer;
                                text-decoration:none
                            ">Update Card Detail</a>
                        </div>
                    </div >
                    `;
              SendMail.sendEmail(
                booking.bookingUser.dataValues.email,
                "Booking Status Changed",
                content
              ).then(
                (resMail) => {
                  resolve({ message: "Status Updated" });
                },
                (errMail) => {
                  resolve({ message: "Status Updated" });
                  // reject({ error: errMail });
                }
              );
            } else {
              resolve({ message: "Status Updated" });
            }
          },
          (err) => {
            reject({ message: "Booking Cancellation failed..!!!" });
          }
        );
      },
      (err) => {
        reject({ message: "Booking Status update failed..!!!", err: err });
      }
    );
  });
};
