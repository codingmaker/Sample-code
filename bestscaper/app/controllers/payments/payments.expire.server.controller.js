"use strict";

var config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    Payment = mongoose.model('Payment'),
    Company = mongoose.model('Company'),
    nodemailer = require('nodemailer'),
    async = require('async'),
    moment = require('moment'),
    request = require('request'),
    ejs = require("ejs"),
    path = require('path'),
    fs = require('fs');

var stripe = require("stripe")(config.stripe.secretKey);

var smtpTransport = nodemailer.createTransport(config.mailer.options);


exports.warningExpire = function(){
	//when payment has 6~8 days left. 
	var day6 = moment().add(6,'days');
	var day8 = moment().add(8,'days');

	Company.find({
		$and : [
			{ 'payment.to' : {
					$gt : day6,
					$lt : day8
				} 
			},
			{ 'payment.emailed' : false }
		]
	},function(err,docs){
		console.log('----------warning payment------------');
		console.log(docs);
		console.log('----------warning payment------------');

		docs.forEach(function(doc){
            
			doc.payment.emailed = true;
			doc.save();
			
			ejs.renderFile(path.resolve(__dirname+'../../../views/email_templates/payment-warning-email.server.view.html'),{
				companyName : doc.companyName,
	            appName: config.app.appName,
	        }, function(err, emailHTML) {
	        	
	            var mailOptions = {
	                to: doc.companyEmail,
	                from: config.mailer.from,
	                subject: 'Please renew your membership subscription',
	                html: emailHTML
	            };
	            smtpTransport.sendMail(mailOptions);
	        });		
			
		})
	})


	

};


exports.updateExpiredCompany = function(){
	Company.find({
		'payment.to' : { $lt : moment() }
	},function(err, docs){
		docs.forEach(function(doc){
            doc.payment.coupon = false;			
			doc.payment.from = null;
			doc.payment.to = null;
			doc.payment.pay = [];
			doc.payment.emailed = false;
			doc.payment.plan = 'Basic';
			doc.coveredAreas.splice(2);
			doc.save();
			
			ejs.renderFile(path.resolve(__dirname+'../../../views/email_templates/payment-expired-email.server.view.html'),{
				companyName : doc.companyName,
	            appName: config.app.appName,
	        }, function(err, emailHTML) {
	        	
	            var mailOptions = {
	                to: doc.companyEmail,
	                from: config.mailer.from,
	                subject: 'Your membership subscription has expired',
	                html: emailHTML
	            };
	            smtpTransport.sendMail(mailOptions);
	        });		
			
		})
	})
	
};
    