
/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	config = require('../../../config/config'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Payment  = mongoose.model('Payment'),
	moment = require('moment'),
	request = require('request');




exports.renderPassword = function(req, res) {

	res.render('pages/me/account/password',{
		title : 'Bestscaper : Password Change',
		keywords : config.app.keywords,
		description : config.app.description,
		user : req.user,
		moment : moment
	})
	
};

exports.renderBilling = function(req, res) {
	Payment.find({
		'user' : req.user._id
	})
	.sort('-created')
	.exec(function(err, payments){
		
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			res.render('pages/me/account/billing',{
				title : 'Bestscaper : Billing information',
				keywords : config.app.keywords,
				description : config.app.description,
				user : req.user,
				moment : moment,
				payments : payments
			})
		}
	})
};


exports.renderEmailNotification = function(req, res) {
	res.render('pages/me/account/email',{
		title : 'Bestscaper : Email notification',
		keywords : config.app.keywords,
		description : config.app.description,
		user : req.user,
		moment : moment
	})
};

exports.changeEmailNotification = function(req, res){
	var user = req.user;

	user.emailNotification = {
		bestscaper : req.body.bestscaper,
		subscribe : req.body.subscribe,
		offer : req.body.offer,
		expire : req.body.expire
	}
	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);
				}else{
					res.json({
						'status':'success',
						'logCount' : user.logs.length
					})
				}
			});
		}
	});
}


