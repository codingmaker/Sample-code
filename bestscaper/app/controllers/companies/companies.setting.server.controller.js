var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Company = mongoose.model('Company'),
	async = require('async');

exports.updateBasic = function(req, res, next){
	var company = req.company;
	var companyAddress  = {
		'street' : req.body.companyAddress.route,
		'streetNumber' : req.body.companyAddress.street_number,
		'city' : req.body.companyAddress.locality,
		'state' : req.body.companyAddress.administrative_area_level_1,
		'country' : req.body.companyAddress.country,
		'postalCode' : req.body.companyAddress.postal_code,
		'other' : req.body.companyAddress.other,
		'findAddress' : req.body.companyAddress.findAddress
	};
	company.companyName = req.body.companyName;
	company.companyEmail = req.body.companyEmail;
	company.companyContactNumber = req.body.companyContactNumber;
	company.companyAddress = companyAddress;
	company.location.coordinates = req.body.location.coordinates;

	
	company.save(function(err){
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			res.json({
				'status': 'success'
			})
		}
	})

	
}
exports.updateAdvanced = function(req, res, next){
	var company = req.company;
	var areaLength = req.body.coveredAreas.length;
	if(company.payment.plan == 'Basic' && areaLength > 2){
		res.json({
			'status' : 'fail',
			'reason' : 'coveredArea',
			'message' : 'Basic membership plan cannot support over 2 Business areas'
		});
	}else if(company.payment.plan == 'Gold' && areaLength > 4){
		res.json({
			'status' : 'fail',
			'reason' : 'coveredArea',
			'message' : 'Gold membership plan cannot support over 5 Business areas'
		});
	}else if(company.payment.plan == 'Platinum' && areaLength > 6){
		res.json({
			'status' : 'fail',
			'reason' : 'coveredArea',
			'message' : 'Platinum membership plan cannot support over 6 Business areas'
		});
	}else{
		company.categories = req.body.categories;
		company.coveredAreas = req.body.coveredAreas;
		company.services = req.body.services;
		company.description = req.body.description;
		company.save(function(err){
			if(err){
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}else{
				req.company = company;
				res.json({
					'status': 'success'
				})
			}
		})

	}
	
}

exports.updateMarketing = function(req, res, next){
	var company = req.company;

	Company.findUniqueId(req.body.id,null,function(availableId){
		
		if( availableId == req.body.id || req.body.id == company.id){
			
			company.id = req.body.id;
			company.seo.description = req.body.description;
			company.seo.title = req.body.title;
			company.seo.keywords = req.body.keywords;
			company.seo.changed = true;
			company.save(function(err){
				if(err){
					return res.status(400).send({
						message : errorHandler.getErrorMessage(err)
					});
				}else{
					res.json({
						'status': 'success'
					})
				}
			})
		}else{

			res.json({
				'status' : 'fail',
				'reason' : 'someone already took that address'
			})

		}
	})
	

}