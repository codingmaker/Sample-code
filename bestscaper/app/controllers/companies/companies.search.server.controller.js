
var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	Company = mongoose.model('Company'),
	async = require('async');

exports.findByLocation = function(coordinates, callback){

	Company.aggregate([
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
			$match : { 'valid' : true }
		},
		{
			$project: {
        		'_id': 1,
        		'id': 1,
        		'companyName' : 1,
        		'companyLogo' : 1,
        		'location' : 1,
        		'companyContactNumber' : 1,
        		'reviews' : { $cond : [ { $eq : [ "$reviews", [] ] }, [ { rating : 0 } ], '$reviews' ] }
        		
    		}	
    	},
		{
			$unwind : '$reviews'
		},
		{
			$group : {
				'_id' : {
					'id' : '$id',
					'companyName' : '$companyName',
					'companyLogo' : '$companyLogo',
					'location' : '$location',
					'companyContactNumber' : '$companyContactNumber'
				},
				'avgRating' : { $avg : '$reviews.rating' }
			}
		}
	], function(err,data){
		if(err){
			
		}else{
			callback(data)
		}
	})
	
}

exports.findByAddress = function(page,address,callback){
	var perPage = 8;

	var query1 = {
		$match : { $and : [ {'valid' : true} ] } 
	}
	var query2 = {
		$and : [{'valid' : true}]
	}
	if(address.country){
		query1.$match.$and.push({'coveredAreas.country' : address.country });
		query2.$and.push({'coveredAreas.country' : address.country });
		if(address.state){
			query1.$match.$and.push({'coveredAreas.state' : address.state });
			query2.$and.push({'coveredAreas.state' : address.state });
			if(address.city){
				query1.$match.$and.push({'coveredAreas.city' : address.city }) ;
				query2.$and.push({'coveredAreas.city' : address.city });

			}
		}
	}else{
		query1 = { $match : { 'valid' : true } };
		query2 = { 'valid' : true };
	}
	Company.count(query2, function(err,n){
		console.log(address);
		Company.aggregate([
			query1,
			{ 
				$project: {
	        		'_id': 1,
	    			'id': 1,
	        		'companyName' : 1,
	        		'companyLogo' : 1,
	        		'reviews' : { $cond : [ { $eq : [ "$reviews", [] ] }, [ { rating : 0 } ], '$reviews' ] }
    			}
    		},
			{
				$unwind : '$reviews'
			},
			{
				$group : {
					'_id' : {
						'id' : '$id',
						'companyName' : '$companyName',
						'companyLogo' : '$companyLogo'
					},
					'avgRating' : { $avg : '$reviews.rating' }
				}
			},
			{
				$sort : { 
					'avgRating' : -1
				}
			},
			{
				$skip : perPage * (page - 1)
			},
			{
				$limit : perPage
			}
		],function(err, companies){
			var result = {
				maxPage : Math.ceil(n/perPage),
				nowPage : page,
				count : n,
				companies : companies
			}

			if( n == 0 ){ result.maxPage = 1;}
			if(err){
				
			}else{
				console.log(result);
				callback(result);
			}
		})
	})
}