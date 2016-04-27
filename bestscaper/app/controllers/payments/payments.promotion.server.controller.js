"use strict";

var config = require('../../../config/config'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    Payment = mongoose.model('Payment'),
    Company = mongoose.model('Company'),
    nodemailer = require('nodemailer'),
    async = require('async'),
    moment = require('moment');


// var stripe = require("stripe")(config.stripe.secretKey);


var smtpTransport = nodemailer.createTransport(config.mailer.options);

// paypal.configure(config.paypal);



exports.usePromotionCode =function(req, res, next){
	// end of November.
	var coupon1 = {
		code : "startscaping2015",
		plan : 'Platinum',
		period : moment().add(1,'months')
	} 

	 // for Erica's dad.
	var coupon2 = {
			code : "platinumpapa",
			plan : 'Platinum',
			period : moment().add(4,'years')
		}

	var coupon3 = {
		code : "testerWarn",
		plan : 'Platinum',
		period : moment().add(7,'days')
	}
	
	var coupons = [coupon1 , coupon2, coupon3];

    // console.log(req.body);
    var used = false;
	var valid = false;
	var selectedCoupon;

	Company.findOne({
        $and : [
        	{'owner' : req.user._id } ,
        	{'valid' : true }
        ]
        },function(err,company){
    
    	if(err){
    		// err
    	}else{

    		if(company){
    			coupons.forEach(function(pc){
    				if(pc.code == req.body.code){
    					selectedCoupon = pc;
    					valid = true;
    				}
    			})
    			if(valid){
    				// if this is valid coupon.
    				company.payment.usedCoupon.forEach(function(usedCoupon){
	    				if(usedCoupon.code == selectedCoupon.code){
	    					used = true;
	    				}

	    			})

	    			if(used){
	    				res.json({
	    					status :'fail',
	    					message : 'Sorry, You arleady used this promotion code.'
	    				})
	    			}else{
	    				company.payment.plan = selectedCoupon.plan;
	    				company.payment.to = selectedCoupon.period;
	    				company.payment.usedCoupon.push(selectedCoupon);
	    				company.payment.coupon = true;
	    				company.save(function(err){
	    					if(err){

	    					}else{
	    						res.json({
	    							status : 'success'
	    						})
	    					}
	    				})
	    			}

    			}else{

    				res.json({
    					status :'fail',
    					message : 'This promotion code is invalid or expired. Please check your code.'
    				})

    			}
    			




    		}else{
    			// no result from user id.
    		}
    	}
    })
    
};

