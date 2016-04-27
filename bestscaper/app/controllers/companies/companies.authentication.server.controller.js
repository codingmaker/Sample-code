'use strict';
/**
 * Module dependencies.
 */
var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Company = mongoose.model('Company'),
	async = require('async'),
	sm = require('sitemap');

exports.addCompany = function(req, res){
	if (!req.isAuthenticated()) {
		return res.render('require_login',{
			title : 'Require Login',
			description : config.app.description,
			keywords : config.app.keywords
		})
	}else{
		var user = req.user;
		if(user.roles.indexOf('company') > 0){
			res.json({
				'status' : 'fail',
				'message' : 'You already have company.'
			})
		}else{
			console.log(req.body);
			Company.findUniqueId(req.body.companyName.replace(/ /g,"_"),null,function(availableId){
				var companyAddress = {
					'street' : req.body.companyAddress.route,
					'streetNumber' : req.body.companyAddress.street_number,
					'city' : req.body.companyAddress.locality,
					'state' : req.body.companyAddress.administrative_area_level_1,
					'country' : req.body.companyAddress.country,
					'postalCode' : req.body.companyAddress.postal_code,
					'other' : req.body.companyAddress.other,
					'findAddress' : req.body.companyAddress.findAddress
				};

				var saveCompany = new Company({
					'id' : availableId,
					'companyName' : req.body.companyName,
					'companyEmail' : req.body.companyEmail,
					'companyContactNumber' : [ { number : req.body.companyContactNumber, note : 'Main' } ],
					'owner' : user._id,
					'companyAddress' : companyAddress,
					'coveredAreas' : [{
						city : companyAddress.city,
						state : companyAddress.state,
						country : companyAddress.country
					}],
					'location' : req.body.location,
					'albums' : [{
						title : 'My Album',
						description : '',
						photos : []
					}],
					'seo' : {
						title : req.body.companyName + ':' + companyAddress.findAddress,
						keywords : ['landscaping','landscaper','bestscaper','landscaping pictures','landscape','lawn','garden design','landscape design','landscaping service in ' + req.body.companyAddress.locality, 'landscaper in '+req.body.companyAddress.locality],
						description : 'Landscaping in ' + req.body.companyAddress.locality + ', contactNumber :' + req.body.companyContactNumber
					}

				})

				saveCompany.save(function(err){
					// now user has company. to change the roles
					req.user.roles.push('company');
					req.user.save(function(err){
						if(err){
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						}else{
							res.json({
								'status' :'success'
							})
						}
					})
					
				})


			})
			
		}
		
	}
}


