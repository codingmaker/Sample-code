"use strict";

var config = require('../../../config/config'),
    mongoose = require('mongoose'),
    Company = mongoose.model('Company'),
    Contact = mongoose.model('Contact'),
    nodemailer = require('nodemailer'),
    async = require('async'),
    moment = require('moment');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

exports.createContact = function(req, res, next){

	console.log(req.body);
	var user = null;
	if(req.user){
		user = req.user._id;
	};

	async.waterfall([
		function(done){
			var saveContact = new Contact({
				firstName : req.body.firstName,
				lastName : req.body.lastName,
				email : req.body.email,
				contactNumber : req.body.contactNumber,
				title : req.body.title,
				message : req.body.message,
				company : req.body.companyId,
				user : user

			});
			console.log(saveContact);
			saveContact.save(function(err,contact){
				done(err, contact);
			})

		},
		function(contact,done){
			Company.findOne({
				'_id' : req.body.companyId
			},function(err,company){
				done(err,contact,company);
			})
		},
		function(contact,company,done){
			
            res.render('email_templates/contact-email.server.view.html', {
                appName: config.app.appName,
                firstName : contact.firstName,
                lastName : contact.lastName,
                email : contact.email,
                contactNumber : contact.contactNumber,
                title : contact.title,
                message : contact.message,
                company : company
            }, function(err, emailHTML) {
                var mailOptions = {
                    to: company.companyEmail,
                    from: config.mailer.from,
                    subject: contact.title + ' - Bestscaper.com',
                    html: emailHTML
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    done(err);
                });
          	})
		},
		function(done){
			res.json({
				'status' : 'success'
			})
		}
	],function(err){
		if (err) return next(err);
	})

}