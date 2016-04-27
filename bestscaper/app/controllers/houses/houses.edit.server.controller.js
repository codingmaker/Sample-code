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
	House = mongoose.model('House'),
	request = require('request'),
	async = require('async');

// exports.savePost = function(req, res, next){
// 	var formData = req.body;
// 	House.findOne({
// 		$and : [
// 		{'_id' : req.params.id},
// 		{'owner' : req.user._id}
// 		]
// 	},function(err, house){
// 		if(err){
// 			return res.status(400).send({
// 				message: errorHandler.getErrorMessage(err)
// 			});
// 		}else{
// 			console.log('line 26');
// 			console.log(house);
// 			house.wanted = formData.wanted;
// 			house.postTitle = formData.postTitle;
// 			house.description = formData.description;
// 			house.serviceType = formData.serviceType;
// 			house.save(function(err){
// 				if(err){
// 					return res.status(400).send({
// 						message: errorHandler.getErrorMessage(err)
// 					});
// 				}else{
// 					res.json({
// 						'status' :'success'
// 					})
// 				}
// 			})
// 		}
// 	})
// }

exports.updateHouse = function(req, res, next){
	var formData = req.body;
	var house = req.house;
	
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
	
	house.address = address;

	house.email =req.body.email;
	house.contactNumber = req.body.contactNumber;
	house.title = req.body.title;
	house.location.coordinates = req.body.location.coordinates;
	house.save(function(err){
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
	
}

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

exports.updatePhotos = function(req, res){
	var user = req.user;
	var house = req.house;
	var photos = req.body.photos;

	photos.forEach(function(photo){
		var p = {
			name : photo.name,
		    size : photo.size,
		    url : photo.url,
		    deleteUrl : photo.deleteUrl
		}
		house.photos.unshift(p);
	});

	house.save(function(err){
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			res.json({
				'status' : 'success',
				'photos' : house.photos
			})
		}
	})
}
exports.updateMainPhoto = function(req, res){
	var user = req.user;
	var house = req.house;
	var mainPhoto = req.body;
	console.log(mainPhoto);
	if(house.mainPhoto.name){
		request({
    	// will be ignored
    	method: 'DELETE',
    	uri: house.mainPhoto.deleteUrl,
    	json : true
		},function(err,response,body){
			
		})
	};

	house.mainPhoto = {
        'name' : mainPhoto.name,
        'size' : parseInt(mainPhoto.size),
        'url' : mainPhoto.url,
        'deleteUrl' : mainPhoto.deleteUrl
    };
	
	house.save(function(err){
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

exports.removeMainPhoto = function(req,res){
	var user = req.user;
	var house = req.house;

	if(house.mainPhoto.name){
		request({
    	// will be ignored
    	method: 'DELETE',
    	uri: house.mainPhoto.deleteUrl,
    	json : true
		},function(err,response,body){
			
		})
	};

	house.mainPhoto = null;
	
	house.save(function(err){
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


exports.removePhoto = function(req,res){
	var user = req.user;
	var house = req.house;
	var photoId = req.body.photoId;
	var selectedPhoto;
	console.log(req.body);
	for(var i = 0; i < house.photos.length; i++){
		if(photoId == house.photos[i]._id){
			selectedPhoto = house.photos[i];
			house.photos.splice(i,1);
			break;
		}
	}

	console.log(selectedPhoto);
	request({
    	// will be ignored
    	method: 'DELETE',
    	uri: selectedPhoto.deleteUrl,
    	json : true
		},function(err,response,body){
	})

	house.save(function(err){
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			res.json({
				'status' : 'success',
				'photos' : house.photos
			})
		}
		
	})
}