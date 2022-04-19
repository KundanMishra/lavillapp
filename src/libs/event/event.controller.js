const EventModel = require('./event.model');
const crypto = require('crypto');

exports.insert = (req, res) => {
    if(req.file){
        req.body.image = `uploads/events/${req.file.filename}`;
    }
    EventModel.createEvent(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.editEvent = (req, res) => {
    if(req.file){
        req.body.image = `uploads/events/${req.file.filename}`;
    }
    EventModel.editEvent(req.body,req.params.eventId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};

exports.getEvent = (req, res) => {
    EventModel.getEvent(req.params.eventId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.setEventFeatured = (req, res) => {
    EventModel.setEventFeatured(req.params.eventId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.setEventUnfeatured = (req, res) => {
    EventModel.setEventUnfeatured(req.params.eventId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.findAllEvent = (req, res) => {
    EventModel.findAllEvent(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllEvent = (req, res) => {
    
    EventModel.listAllEvent()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listFeaturedEvent = (req, res) => {
    
    EventModel.listFeaturedEvent()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getAllEvent = (req, res) => {
    
    EventModel.getAllEvent()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.deleteEvent = (req, res) => {
    EventModel.deleteEvent(req.params.eventId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};