"use strict";

var config = require('../../../config/config'),
    errorHandler = require('../errors.server.controller'),
    // paypal = require('paypal-rest-sdk'),
    mongoose = require('mongoose'),
    Payment = mongoose.model('Payment'),
    Company = mongoose.model('Company'),
    nodemailer = require('nodemailer'),
    async = require('async'),
    moment = require('moment');


var stripe = require("stripe")(config.stripe.secretKey);


var smtpTransport = nodemailer.createTransport(config.mailer.options);

// paypal.configure(config.paypal);

exports.createPayment =function(req, res, next){
    // console.log(req.body);

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
        function(payment, done){
            var newPayment = new Payment({
                id : payment.id,
                user : req.user._id,
                object : payment.object,
                status : payment.status,
                amount : payment.amount,
                currency : payment.currency,
                description : description,
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
        },function(payment,done){
            Company.findOne({
                $and : [ 
                    { 'owner' : req.user._id},
                    { 'valid' : true}
                ]
            },function(err,company){
                if(err){

                }else{
                    if(company){
                        company.payment.coupon = false;
                        company.payment.plan = req.body.plan;
                        company.payment.from = moment(); 
                        company.payment.to = moment().add(req.body.month, 'months');
                        var pay = {
                            startFrom : moment(),
                            // to : moment().add(req.body.month, 'seconds'),
                            to : moment().add(req.body.month, 'months'),
                            id : payment.id,
                            amount : total,
                            description : description,
                            currency : payment.currency
                        }
                        // reset warning email.
                        company.payment.emailed = false;
                        company.payment.pay = [];
                        company.payment.pay.push(pay);
                        company.save(function(err){
                            res.json({
                                'status' : 'success'
                            })
                        })
                    }

                }
            })
        }
    ], function(err){
        if (err) return next(err);
    })

};

