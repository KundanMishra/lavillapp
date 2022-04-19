const express = require('express');
const moment = require('moment');
const CronJob = require('cron').CronJob;
const bodyParser = require('body-parser');
const user = require('./libs/user/user.route');
const employee = require('./libs/employee/employee.route');
const fs = require('fs');
const https = require('https')
const morgan = require('morgan')

const introBanner = require('./libs/intro-banner/intro-banner.route');
const branch = require('./libs/branch/branch.route');
const roomCategory = require('./libs/room-category/room-category.route');
const authorization = require('./authorization/routes.config');
const amenities = require('./libs/amenities/amenities.route');
const room = require('./libs/room/room.route');
const booking = require('./libs/booking/booking.route');
const property = require('./libs/property/property.route');
const promoCode = require('./libs/promo-code/promo-code.route');
const event = require('./libs/event/event.route');
const externalApi = require('./libs/external-api/external-api.route');
const settings = require('./libs/settings/settings.route');
const offer = require('./libs/offer/offer.route');
const loyalty = require('./libs/loyalty/loyalty.route');
const cors = require('cors');
const masterData = require('./libs/masters');
const cron = require('./libs/cron');
const app = express();
// app.use(function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Credentials', 'true');
//     res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE');
//     res.header('Access-Control-Expose-Headers', 'Content-Length');
//     res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
//     if (req.method === 'OPTIONS') {
//         return res.sendStatus(200);
//     } else {
//         return next();
//     }
// }); 
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(cors())
app.use(morgan('tiny'))
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded())
masterData.updateMaster();
user.userRoutes(app);
employee.employeeRoutes(app);
introBanner.introBannerRoutes(app);
branch.branchRoutes(app);
roomCategory.roomCategoryRoutes(app);
authorization.authorizationRoutes(app);
amenities.amenitiesRoutes(app);
room.roomRoutes(app);
booking.bookingRoutes(app);
property.propertyRoutes(app);
promoCode.promoCodeRoutes(app);
event.eventRoutes(app);
externalApi.externalApiRoutes(app);
settings.settingsRoutes(app);
offer.offerRoutes(app);
loyalty.loyaltyRoutes(app);


app.get('/', [
    function (req, res) {
        res.status(201).send("Welcome To La Villa");
    }
]);



app.use('/assets/images', express.static('assets/images'));
app.use('/uploads/banners', express.static('uploads/banners'));
app.use('/uploads/profile', express.static('uploads/profile'));
app.use('/uploads/room', express.static('uploads/room'));
app.use('/uploads/room-addon', express.static('uploads/room-addon'));
app.use('/uploads/property', express.static('uploads/property'));
app.use('/uploads/branch-nearest-item', express.static('uploads/branch-nearest-item'));
app.use('/uploads/events', express.static('uploads/events'));
app.use('/assets/images', express.static('assets/images'));
app.use('/uploads/branch', express.static('uploads/branch'));
// app.listen(process.env.PORT, function () {
//     console.log('app listening at port %s', process.env.PORT);
// });
const job = new CronJob('0 0 18 * * *', function () {

// const job = new CronJob('* * * * * *', function () {
    console.log('Before job instantiation');
    cron.cron();
    console.log('After job instantiation');
});
job.start();


//for running in localhost ssl

// const httpsOptions = {
//     key: fs.readFileSync('./key.pem'),
//     cert: fs.readFileSync('./cert.pem')
// }

// https.createServer(httpsOptions, app).listen(3000, function () {
//     console.log('app listening at port %s', 3000);
// });


//for running in server

app.listen(3000, function () {
    console.log('app listening at port %s', 3000);
});