'use strict'

var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Post = mongoose.model('Post'),
	async = require('async');


exports.findByLocation = function(coordinates,callback){
	Post.aggregate([
		{ 
			$geoNear : {
				near : { type : "Point", coordinates : [ coordinates[1] , coordinates[0] ]},
				spherical: true,
				distanceField : "distance",
				maxDistance : 3000,
				distanceMultiplier : 6378137
			}
		},
		{
			$match : {
				'wanted.status' : 'Open'
			}
		},
		{
			$group : {
				_id : { 
					'house' : '$house' ,
					'location':'$location'
				},
				posts : {
					$push : {
						'_id' : '$_id',
						'title' : '$title',
						'posted' : '$posted'

					} 
				}
			}
		}
		
	],function(err, result){
		callback(result);
	})

	
}


exports.findByAddress = function(page, address, callback){
	var perPage = 6;
	var query = {
		$and : [ {'wanted.status' : 'Open'} ]
	};

	if(address.country){
		query.$and.push({'address.country' : address.country});
	}
	if(address.state){
		query.$and.push({'address.state' : address.state});
	}
	if(address.city){
		query.$and.push({'address.city' : address.city});
	}

	Post.count(query, function(err,n){
		Post.find(query)
		.limit(perPage)
		.skip(perPage * (page - 1) )
		.populate('house')
		.sort('-posted')
		.exec(function(err, posts){

			var result = {
				count : n,
				maxPage : Math.ceil(n / perPage),
				nowPage : page,
				posts : posts
			}
			if( n == 0 ){ result.maxPage = 1;}
			callback(result);
		})
	})
}

