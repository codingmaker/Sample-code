'use strict';
var config = require('../../../config/config'),
	mongoose = require('mongoose'),
    nodemailer = require('nodemailer'),
	Company = mongoose.model('Company'),
	errorHandler = require('../errors.server.controller'),
	async = require('async');

var smtpTransport = nodemailer.createTransport(config.mailer.options);


exports.addSubscriber = function(req,res){
	var user = req.user;
	
	// login require
	if(user){
		var companyId = req.body.companyId;

		Company.findOne({ '_id': companyId},function(err,company){
			var subscriber = {
				user : user._id
			}
			//prevent bot.
			for(var i = 0; i < company.subscribers.length; i++){
				if(company.subscribers[i].user.toString() === user._id.toString() ){
					company.subscribers.splice(i,1);
					break;
				}
			}
			
			company.subscribers.unshift(subscriber);

			company.save(function(err){
				if(err){
					return res.status(400).send({
						message : errorHandler.getErrorMessage(err)
					});
				}else{
					res.json({
						'status' :'success',
						'subscriberCount' : company.subscribers.length
					})
				}
			})		
		})
	}else{
		res.status(400).send({
			message: 'User is not signed in'
		});

	}

}

exports.removeSubscriber = function(req,res){

	var user = req.user;
	if(user){
		var companyId = req.body.companyId;

		Company.findOne({ '_id': companyId},function(err,company){
			
			for(var i = 0; i < company.subscribers.length; i++){
				if(company.subscribers[i].user.toString() === user._id.toString() ){
					company.subscribers.splice(i,1);
					break;
				}
			}

			company.save(function(err){
				if(err){
					return res.status(400).send({
						message : errorHandler.getErrorMessage(err)
					});
				}else{
					res.json({
						'status' :'success',
						'subscriberCount' : company.subscribers.length
					})
				}
			})		
		})
	}else{
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
	
}
exports.sendEmail = function(req, res){

	var title = req.body.title;
	var content = req.body.content;


	Company.findOne({
	$and : [ 
		{ 'owner' : req.user._id},
		{ 'valid' : true}
	]
	})
	.populate('subscribers.user')
	.exec(function(err,company){
		console.log(company);
		if(company){
			async.each(company.subscribers,function(subscriber, callback ){
				if(subscriber.user.emailNotification.subscribe){
					res.render('email_templates/subscriber-email.server.view.html', {
		                appName: config.app.appName,
		                subscriber : subscriber,
		                company : company,
		                content : content
		            }, function(err, emailHTML) {
		                var mailOptions = {
		                    to: subscriber.user.email,
		                    from: config.mailer.from,
		                    subject: title +'-'+config.app.appName+'(Subscriber email)',
		                    html: emailHTML
		                };
		                smtpTransport.sendMail(mailOptions, function(err) {
		                    callback();
		                });
		            });
				}else{
					callback();
				}

			},function(err){
				if(err){
					return res.status(400).send({
						message : errorHandler.getErrorMessage(err)
					});
				}else{
					res.json({
						status : 'success'
					})
				}

			})
		}
		
	})
}