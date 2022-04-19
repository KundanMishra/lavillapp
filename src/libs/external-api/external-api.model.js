const request = require('request');
const env = require('../../configs/env');
_EXTERNAL_URL = 'https://test-proj-heroku.herokuapp.com/api/plans';

exports.requestPayment = (body) => {
    return new Promise((resolve, reject) => {
        let data = {
            
        };
        const formData = {
            "mode":env.payment.mode,
            "amount":body.amount,
            "action":"capture",
            "secretKey":env.payment.secretKey,
            "referenceId":body.orderId,
            "gatewayId":env.payment.gatewayId,
            "token":"true",
            "returnUrl":`${env.appEndpoint}accept-payment`,
            "email":env.payment.email,
            "phone":env.payment.phone,
            "name":env.payment.name,
            "country":env.payment.country,
            "address":env.payment.address,
            "city":env.payment.city,
            "description":body.roomName,
            "currency":env.payment.currency
          };
          request.post({url:env.payment.url,  form: formData}, function optionalCallback(err, httpResponse, res) {
            if (err) {
             reject( err);
            }
            resolve(res);
          }); 
    });
};