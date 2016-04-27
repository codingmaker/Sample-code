"use strict";

var config = require('../../../config/config'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    Payment = mongoose.model('Payment'),
    Company = mongoose.model('Company'),
    nodemailer = require('nodemailer'),
    async = require('async'),
    moment = require('moment');


var stripe = require("stripe")(config.stripe.secretKey);
var smtpTransport = nodemailer.createTransport(config.mailer.options);


exports.renewPayment =function(req, res, next){
    console.log(req.body);

    // var savedCard = {
    //     "type": "visa",
    //     "number": req.body.number,
    //     "expire_month": req.body.expire_month,
    //     "expire_year": "20" + req.body.expire_year,
    //     "cvv2": req.body.cvv2,
    //     "first_name": req.user.firstName,
    //     "last_name": req.user.lastName
    // };
    var stripeToken = req.body.stripeToken;
    var month = req.body.month;
    var plan = req.body.plan;
    var description = plan+" Membership Plan "+month+" Month(s)"
    var total = req.body.total * 100;
   
    async.waterfall([
        function(done){
            var charge = stripe.charges.create({
              amount: total, // amount in cents, again
              currency: "cad",
              source: stripeToken,
              description: description
            }, function(err, payment) {
                
                if (err && err.type === 'StripeCardError') {
                    // The card has been declined
                    res.json({
                        'status' : 'fail',
                        'message' : 'The card has been declined'
                    })
                }else{
                    done(null , payment);
                }
            });
        },
        function(payment,done){
            var newPayment = new Payment({
                id : payment.id,
                user : req.user._id,
                object : payment.object,
                status : payment.status,
                amount : payment.amount,
                currency : payment.currency,
                description : description
            })

            newPayment.save(function(err){
                done(err,payment);
            })
        },
        function(payment,done){
            res.render('email_templates/payment-pay-email.server.view.html', {
                appName: config.app.appName,
                created : moment().format('YYYY-MM-DD HH:mma'),
                total : (total / 100).toFixed(2).toString(),
                currency: payment.currency,
                item : description
            }, function(err, emailHTML) {
                var mailOptions = {
                    to: req.user.email,
                    from: config.mailer.from,
                    subject: 'Confirmation of subscription to Online Billing',
                    html: emailHTML
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    done(err, payment);
                });
            });
        },
        function(payment,done){
            Company.findOne({
                $and : [
                    {'owner' : req.user._id } ,
                    {'valid' : true }
                ]
            },function(err,company){
                if(err){

                }else{
                    if(company){
                        company.payment.pay.push({
                            startFrom : company.payment.to,
                            to : moment(company.payment.to).add(month, 'months'),
                            id : payment.id,
                            amount : total,
                            description : description,
                            currency : payment.currency

                        });
                        // reset warning email.
                        company.payment.emailed = false;
                        company.payment.to = moment(company.payment.to).add(req.body.month, 'months');

                        company.save(function(err){
                            res.json({
                                'status' : 'success'
                            })
                        })
                    }

                }
            })
        }

    ],function(err){
        if(err){ return next(err); }
    })

};




