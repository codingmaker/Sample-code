'use strict'

var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	House = mongoose.model('House'),
	async = require('async');


exports.findByLocation = function(coordinates){
	var point = {
	  	'type' : "Point",
	  	'coordinates' : [ coordinates[1], coordinates[0] ]
	};

	var option = {
  		spherical: true, 
		maxDistance :1000,
        distanceMultiplier:6378137
	};

	
	return House.geoNear(point,option);
}


exports.findByAddress = function(address){
	var query = {
		$and : []
	}

	if(address.country){
		query.$and.push( {'address.country' : address.country});

		if(address.state){
			query.$and.push( {'address.state' : address.state});

			if(address.city){
				query.$and.push( {'address.city' : address.city});


			}
		}
	}

	return House.find(query);
}