'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	config = require('../../../config/config'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Company = mongoose.model('Company'),
	moment = require('moment'),
	request = require('request');




exports.renderDashboard = function(req, res) {
	Company.find({
		'subscribers.user' : req.user._id
	},function(err, companies){

		res.render('pages/me/dashboard', {
			title : 'Bestscaper : Dashboard',
			keywords : config.app.keywords,
			description : config.app.description,
			user : req.user,
			subscriptions : companies,
			moment : moment
		});

	})
	
	
};


/**
 * Update user details
 */
exports.updateProfile = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();

		// user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json({
							'status' : 'success'
						})
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

exports.updateProfilePicture = function(req, res){
	var user = req.user;
	var profilePicture = req.body;
	console.log(req.body);
	console.log(user);
	if(user.profilePicture.name){
		request({
    	// will be ignored
    	method: 'DELETE',
    	uri: user.profilePicture.deleteUrl,
    	json : true
		},function(err,response,body){
			
		})
	};

	user.profilePicture = {
        'name' : profilePicture.name,
        'size' : parseInt(profilePicture.size),
        'url' : profilePicture.url,
        'deleteUrl' : profilePicture.deleteUrl
    };
	
	user.save(function(err){
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			res.json({
				'status' : 'success'
			})
		}
	})


}

// /**
//  * Send User
//  */
// exports.me = function(req, res) {
// 	res.json(req.user || null);
// };
