"use strict";

var config = require('../../../config/config'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    Payment = mongoose.model('Payment'),
    Company = mongoose.model('Company'),
    nodemailer = require('nodemailer'),
    async = require('async'),
    moment = require('moment'),
    request = require('request');

var stripe = require("stripe")(config.stripe.secretKey);
var newPayment = require('./payments.create.server.controller');

var smtpTransport = nodemailer.createTransport(config.mailer.options);


exports.upgradePayment = function(req, res, next){
    console.log(req.body);
    var now = moment();
    var updateCompany;
    async.waterfall([
        function(done){
            Company.findOne({
                $and : [
                    {'owner' : req.user._id },
                    {'valid' : true }
                ]
            },function(err,company){
                updateCompany = company;
                done(err,company)
            })
        },function(company,done){

            done(null, company.payment.pay);

        },function(pay,done){
            var refunds = [];

            for(var i =0; i < pay.length; i++){
                // if they didn't even use this plan.
                if(pay[i].startFrom > now){
                    var refund = {
                        id : pay[i].id,
                        amount : pay[i].amount - (pay[i].amount * 0.1),
                        usage : 0,
                        currency : pay[i].currency,
                        description : pay[i].description
                    };

                    refunds.push(refund);
                    //if that is already expired just pass
                }else if(now > pay[i].to){
                    continue;
                }else if( (pay[i].startFrom < now) && (now < pay[i].to) ){
                    var usedDay = ( now.valueOf() -  moment(pay[i].startFrom).valueOf() ) / (1000 * 60 * 60 * 24);
                    usedDay = Math.ceil(usedDay);
                    var totalDay = (moment(pay[i].to).valueOf() - moment(pay[i].startFrom).valueOf() ) / ( 1000 * 60 * 60 * 24) ;
                    totalDay = Math.ceil(totalDay);
                    var usage = usedDay / totalDay;
                    // var refundingRate = 100 - usage;
                    var refundAmount = pay[i].amount - (pay[i].amount * usage);
                    refundAmount -= (refundAmount * 0.1);
                    var refund = {
                        id : pay[i].id,
                        amount : refundAmount,
                        usage : (usage * 100).toFixed(0),
                        currency : pay[i].currency,
                        description : pay[i].description
                    }
                    refunds.push(refund);
                }
            }
            done(null,refunds);
            
        },function(refunds, done){
            

            async.each(refunds, function(refunding, callback){
                console.log(refunding);

                stripe.refunds.create({
                  charge : refunding.id,
                  amount : (refunding.amount).toFixed(0)
                }, function(err, refund) {
                    console.log(refund);
                    var saveRefund = new Payment({
                        user :req.user._id,
                        id : refund.id,
                        amount : refund.amount,
                        currency : refund.currency,
                        object : refund.object,
                        created : refund.created,
                        charge : refund.charge,
                        description : refunding.description
                    });
                    
                    saveRefund.save(function(err){
                        callback();
                    })
                });

            },function(err){
                
                done(err,refunds);
                
            })


        },
        function(refunds,done){
            //if this payment is promotion coupon code.
            if(updateCompany.payment.coupon){
                done(null, refunds);
            }else{
                res.render('email_templates/payment-refund-email.server.view.html', {
                    appName: config.app.appName,
                    created : moment().format('YYYY-MM-DD HH:mma'),
                    items : refunds
                }, function(err, emailHTML) {
                    var mailOptions = {
                        to: req.user.email,
                        from: config.mailer.from,
                        subject: 'Confirmation of refunding subscription',
                        html: emailHTML
                    };
                    smtpTransport.sendMail(mailOptions, function(err) {
                        done(err, refunds);
                    });
                });
            }
            
        },
        function(done){
            newPayment.createPayment(req,res);
        }


    ], function(err){
        if(err){ return next(err)}
    })
    
};
    