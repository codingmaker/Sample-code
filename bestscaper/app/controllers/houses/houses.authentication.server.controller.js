'use strict';
/**
 * Module dependencies.
 */
var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	House = mongoose.model('House'),
	async = require('async');


exports.addHouse = function(req, res){
	var user = req.user;

	var address  = {
		'street' : req.body.address.route,
		'streetNumber' : req.body.address.street_number,
		'city' : req.body.address.locality,
		'state' : req.body.address.administrative_area_level_1,
		'country' : req.body.address.country,
		'postalCode' : req.body.address.postal_code,
		'other' : req.body.address.other,
		'findAddress' : req.body.address.findAddress
	}
	var saveHouse = new House({
		'title' : req.body.title,
		'location' : req.body.location,
		'owner' : req.user._id,
		'email' : req.body.email,
		'contactNumber' : req.body.contactNumber,
		'address' : address
	})

	saveHouse.save(function(err, house){

		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{

			user.houses.push(house._id);
			user.save(function(err, user){
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					req.login(user, function(err) {
						if (err) {
							res.status(400).send(err);
						} else {
							// Return authenticated user
							res.json({
								'status' : 'success'
							})
						}
					});
				}
			})
			
		}
	})

	
	

}

