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
	Company = mongoose.model('Company'),
	Post = mongoose.model('Post'),
	nodemailer = require('nodemailer'),
	async = require('async'),
	moment = require('moment');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

exports.savePost = function(req, res, next){


	async.waterfall([
		function(done){
			Post.count({
				$and : [
					{ writer : req.user._id },
					{
						posted : {
							$gt : moment().subtract(1, 'days'),
							$lt : moment()
						}
					}
				]
			},function(err, n){
				console.log(n);
				if(err){
					done(err);
				}else{
					if(n >= 2){
						res.json({
							'status' :'fail',
							'reason' : 'abusing',
							'message' : 'Sorry you have reached the daily limit of 2 posts. <br/> Please wait 24 hours before posting again'
						})
					}else{
						done(null);
					}
				}
			})			
		},
		function(done){
			House.findOne({
				$and : [
					{ '_id' : req.body.house},
					{ 'owner' : req.user._id}
				]
			})
			.select('_id address location')
			.exec(function(err,house){
				done(err,house);
			});
		},
		function(house,done){
			var savePost = new Post({
				title : req.body.title,
				description : req.body.description,
				wanted : req.body.wanted,
				hide : req.body.hide,
				categories : req.body.categories,
				address : {
					streetNumber : house.address.streetNumber,
			        street : house.address.street,
			        city : house.address.city,
			        state : house.address.state,
			        country : house.address.country,
			        postalCode : house.address.postalCode,
			        other : house.address.other,
			        findAddress : house.address.findAddress
				},
				'location.coordinates' : house.location.coordinates,
				house : house._id,
				writer : req.user._id
			})

			savePost.save(function(err,post){
				done(err,house,post)
			})
		},
		function(house,post,done){
			Company.find({
				$and  : [ 
					{'payment.plan' : 'Platinum'},
					{'coveredAreas.country' : house.address.country},
					{'coveredAreas.state' : house.address.state},
					{'coveredAreas.city' : house.address.city},
					{'categories' : {$in : post.categories} }
				]
			}).select('companyEmail')
			.exec(function(err, companies){
				console.log(companies);
				res.render('email_templates/post-new-post-email.server.view.html', {
	                appName: config.app.appName,
	                post : post
	            },function(err, emailHTML) {
	            	// forEach for emailing them 
					companies.forEach(function(company){
						var mailOptions = {
		                    to: company.companyEmail,
		                    from: config.mailer.from,
		                    subject: 'New post in your business area',
		                    html: emailHTML
		                };

		                smtpTransport.sendMail(mailOptions);

					});

					done(err,house, post)

	            });
			})
			
		},
		function(house,post,done){

			res.json({
				'postId' : post._id,
				'houseId' : post.house,
				'status':'success'
			})
		}


	],function(err){
		if(err) { return next(err);}
	})
	
}

exports.editPost = function(req, res, next){

	Post.findOne({
		'_id' : req.body.postId
	},function(err,post){
		if(post){
			post.title = req.body.title;
			post.description = req.body.description;
			post.wanted.status = req.body.wanted.status;
			post.wanted.to = req.body.wanted.to;
			post.categories = req.body.categories;
			post.hide = req.body.hide;
			post.save(function(err){
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
		}else{
			// post is not exist.
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		
	})
}

exports.removePost = function(req, res, next){
	var user = req.user;
	Post.remove({
		$and : [ 
			{ '_id' : req.body.postId } ,
			{ 'writer' : user._id },
			{ 'edit.removable' : true}
		]
	},function(err,result){
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			if( result.result.n > 0){
				res.json({
					'status' : 'success'
				})
			}else{
				res.json({
					'status' : 'fail'
				})
			}
		}
	})
}