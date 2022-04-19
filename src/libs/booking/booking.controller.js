const BookingModel = require("./booking.model");
const UserModel = require("../user/user.model");
const SendMail = require("../send-email/index");
const crypto = require("crypto");
const jwt = require("jsonwebtoken"),
  secret = require("../../configs/env").jwt_secret;

exports.createBookingBasic = (req, res) => {
  req.body.bookingStatusId = 1;
  BookingModel.createBookingBasic(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      console.log("error occured ", err);
      // console.log("error", req)
      res.status(406).send(err);
    }
  );
};
exports.createBookingUser = (req, res) => {
  if (req.headers["authorization"]) {
    let authorization = req.headers["authorization"].split(" ");
    if (authorization[0] !== "Bearer") {
    } else {
      req.jwt = jwt.verify(authorization[1], secret);
      req.body.userId = req.jwt.userId;
    }
  }
  req.body.bookingStatusId = 2;
  BookingModel.createBookingUser(req.body).then(
    (result) => {
      res.status(201).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getBookingBasic = (req, res) => {
  BookingModel.getBookingBasic(req.params.bookingId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getBookingUser = (req, res) => {
  BookingModel.getBookingUser(req.params.bookingId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.removeBookingRoomAddonAndOffer = (req, res, next) => {
  BookingModel.removeBookingRoomAddonAndOffer(req.body).then(
    (result) => {
      next();
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.addBookingRoom = (req, res, next) => {
  BookingModel.addBookingRoom(req.body).then(
    (result) => {
      next();
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.updateBookingDateAvailability = (req, res, next) => {
  BookingModel.updateBookingDateAvailability(req.body).then(
    (result) => {
      next();
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.updateBookingBasic = (req, res) => {
  BookingModel.updateBookingBasic(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};

exports.createBookingPromoCode = (req, res, next) => {
  if (req.headers["authorization"]) {
    let authorization = req.headers["authorization"].split(" ");
    if (authorization[0] !== "Bearer") {
    } else {
      req.jwt = jwt.verify(authorization[1], secret);
      req.body.userId = req.jwt.userId;
    }
  }
  if (req.body.bookingPromoCode && req.body.bookingPromoCode != null) {
    BookingModel.createBookingPromoCode(req.body).then(
      (result) => {
        next();
      },
      (err) => {
        res.status(406).send(err);
      }
    );
  } else {
    next();
  }
};
exports.createBookingLoyalty = (req, res, next) => {
  console.log(req.body);
  if (
    req.body.bookingLoyalty &&
    req.body.bookingLoyalty != null &&
    req.body.user_id != null &&
    req.body.user_id != 0
  ) {
    BookingModel.createBookingLoyalty(req.body).then(
      (result) => {
        next();
      },
      (err) => {
        console.log("", err);
        res.status(406).send(err);
      }
    );
  } else {
    next();
  }
};
exports.createBookingCard = (req, res, next) => {
  if (req.body.bookingCard && req.body.bookingCard != null) {
    BookingModel.createBookingCard(req.body).then(
      (result) => {
        next();
      },
      (err) => {
        res.status(406).send(err);
      }
    );
  } else {
    next();
  }
};
exports.updateDateAvailability = (req, res, next) => {
  BookingModel.updateDateAvailability(req.body).then(
    (result) => {
      next();
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.finalBooking = (req, res) => {
  // console.log("req ",req.body)
  BookingModel.finalBooking({
    id: req.body.id,
    bookingPromoCodeId: req.body.bookingPromoCodeId,
    bookingLoyaltyId: req.body.bookingLoyaltyId,
    bookingCardId: req.body.bookingCardId,
    bookingStatusId: 3,
    finalPrice: req.body.finalPrice,
    bookingLoyalty: req.body.bookingLoyalty,
    totalWithoutLoyalty: req.body.totalWithoutLoyalty,
  }).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      // console.log(err)
      res.status(406).send(err);
    }
  );
};

exports.bookingAuthCheck = (req, res) => {
  BookingModel.bookingAuthCheck(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getBookingByIdEmail = (req, res) => {
  BookingModel.getBookingByIdEmail(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};

exports.insert = (req, res) => {
  if (req.headers["authorization"]) {
    let authorization = req.headers["authorization"].split(" ");
    if (authorization[0] !== "Bearer") {
    } else {
      req.jwt = jwt.verify(authorization[1], secret);
      req.body.userId = req.jwt.userId;
    }
  }
  if (req.body.userId == null) {
    let salt = crypto.randomBytes(16).toString("base64");
    let hash = crypto
      .createHmac("sha512", salt)
      .update(req.body.bookingUser.email)
      .digest("base64");
    let user = {
      fName: req.body.bookingUser.fName,
      lName: req.body.bookingUser.lName,
      phone: req.body.bookingUser.phone,
      email: req.body.bookingUser.email,
      password: salt + "$" + hash,
      status: 1,
      permissionLevel: 1,
    };
    UserModel.createUser(user).then(
      (resp) => {
        req.body.userId = resp.id;
        console.log(resp);
        BookingModel.createBooking(req.body).then(
          (result) => {
            res.status(201).send(result);
          },
          (err) => {
            res.status(406).send(err);
          }
        );
      },
      (err) => {
        res.status(406).send(err);
      }
    );
  } else {
    BookingModel.createBooking(req.body).then(
      (result) => {
        res.status(201).send(result);
      },
      (err) => {
        res.status(406).send(err);
      }
    );
  }
};
exports.editBooking = (req, res) => {
  BookingModel.editBooking(req.body, req.params.bookingId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};

exports.getBooking = (req, res) => {
  BookingModel.getBooking(req.params.bookingId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.findAllBooking = (req, res) => {
  BookingModel.findAllBooking(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.listAllBooking = (req, res) => {
  BookingModel.listAllBooking().then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getAllCompletedBooking = (req, res) => {
  BookingModel.getAllCompletedBooking(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getAllBooking = (req, res) => {
  BookingModel.getAllBooking(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.deleteBooking = (req, res) => {
  BookingModel.deleteBooking(req.params.bookingId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getAllUpcomingBooking = (req, res) => {
  BookingModel.getAllUpcomingBooking(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getAllCancelledBooking = (req, res) => {
  BookingModel.getAllCancelledBooking(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getAllNoShowBooking = (req, res) => {
  BookingModel.getAllNoShowBooking(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getAllInvalidBooking = (req, res) => {
  BookingModel.getAllInvalidBooking(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.cancelBooking = (req, res) => {
  BookingModel.cancelBooking(req.body, req.body.userId).then(
    (result) => {
      console.log("cancel result", result);
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.cancelBookingByUser = (req, res) => {
  BookingModel.cancelBooking(req.body, req.jwt.userId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.confirmBookingEmail = (req, res) => {
  BookingModel.confirmBookingEmail(req.params.bookingId, req.jwt.userId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.validateBookingUser = (req, res, next) => {
  BookingModel.validateBookingUser(req.body, req.jwt.userId).then(
    (result) => {
      if (result.dataValues.userId == req.jwt.userId) {
        req.body.bookingCardId = result.dataValues.bookingCardId;
        next();
      } else {
        res.status(406).send({ message: "User not match" });
      }
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.updateCard = (req, res) => {
  BookingModel.updateCard(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getUpcomingBooking = (req, res) => {
  BookingModel.getUpcomingBooking(req.jwt.userId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getCompletedBooking = (req, res) => {
  BookingModel.getCompletedBooking(req.jwt.userId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.getCancelledBooking = (req, res) => {
  BookingModel.getCancelledBooking(req.jwt.userId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.checkOut = (req, res, next) => {
  BookingModel.checkOut(req.body).then(
    (result) => {
      next();
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.checkOutMail = (req, res) => {
  BookingModel.checkOutMail(req.body).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.moveToNoShow = (req, res, next) => {
  BookingModel.moveToNoShow(
    req.params.bookingId,
    req.body.cancellationAmount
  ).then(
    (result) => {
      next();
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.moveToNoShowMail = (req, res) => {
  BookingModel.moveToNoShowMail(req.params.bookingId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
exports.markAsInvalid = (req, res) => {
  BookingModel.markAsInvalid(req.params.bookingId).then(
    (result) => {
      res.status(200).send(result);
    },
    (err) => {
      res.status(406).send(err);
    }
  );
};
