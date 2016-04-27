'use strict';
/**
 * Module dependencies.
 */
var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	companyLog = require('./companies.log.server.controller'),
	mongoose = require('mongoose'),
	Company = mongoose.model('Company'),
	Post = mongoose.model('Post'),
	async = require('async');


exports.writeReview = function(req,res,next){

	var user = req.user;
	var postId = req.body.postId;
	var offerId = req.body.offerId;
	var rating = req.body.rating;
	var content = req.body.review;
	var companyId;
	var logMessage;
	async.waterfall([
		function(done){
			Post.findOne({
				'_id' : postId
			},function(err,post){
				post.offers.forEach(function(offer){
					if(offer._id == offerId){
						offer.reviewed = true;
						companyId = offer.company;
					}

				});
				post.save(function(err){
					done(err);
				})
			})

		},
		function(done){
			
			Company.findOne({
				'_id' : companyId
			},function(err,company){
				var review = {
					rating : rating,
					content : content,
					user : user._id,
					post : postId
				}
				logMessage = '<div class="alert alert-info log"> <span>'+user.firstName +' '+user.lastName+' wrote a review </span>';
				logMessage += '<span> check the </span>';
				logMessage += '<a href="/c/'+company.id+'#reviews" class="check-post alert-link">review</a></div>';
				var log = {
					message : logMessage
				}
				//write review and log. and save it .
				company.reviews.unshift(review);
				company.logs.unshift(log);

				company.save(function(err){
					res.json({
						'status' : 'success'
					})
				})

			})
		}
	],function(err){
		if (err) return next(err);
	})
	


}