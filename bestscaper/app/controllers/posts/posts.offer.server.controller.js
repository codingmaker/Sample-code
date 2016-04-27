'use strict';
/**
 * Module dependencies.
 */
var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	log = require('../users/users.log.server.controller'),
	companyLog = require('../companies/companies.log.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	Company = mongoose.model('Company'),
	Post = mongoose.model('Post'),
	nodemailer = require('nodemailer'),
	async = require('async');


var smtpTransport = nodemailer.createTransport(config.mailer.options);


exports.addOffer = function(req, res, next){
	var user = req.user;
	var params = req.params;
	var content = req.body.offer;
	if(user.roles.indexOf('company') > -1 && user){
		async.waterfall([
			function(done){
				Company.findOne({
					$and : [
	                    {'owner' : req.user._id } ,
	                    {'valid' : true }
	                ]
				},function(err,company){
					done(err,company)
				})
			}
			,function(company,done){

				Post.findOne({
					$and : [
						{'_id' : params.postId},
						{'house' : params.houseId}
					]
				}).populate('writer')
				.exec(function(err,post){
					done(err, company, post);
				})
			},
			function(company, post, done){
				if(post.writer.emailNotification.offer){
		            res.render('email_templates/post-offer-email.server.view.html', {
		                appName: config.app.appName,
		                company : company,
		                post : post
		            }, function(err, emailHTML) {
		                var mailOptions = {
		                    to: post.writer.email,
		                    from: config.mailer.from,
		                    subject: 'You got an offer from ' + company.companyName,
		                    html: emailHTML
		                };
		                smtpTransport.sendMail(mailOptions, function(err) {
		                    done(err, company, post);
		                });
		            });
	            }else{
	            	done(null,company,post);
	            }
	        },
			function(company, post, done){
				var offer = {
					company : company._id,
				    content : content
				}

				var logMessage = '<div class="alert alert-success log">You got an offer from'; 
					logMessage += '<a href="/c/'+company.id+'" class="check-company alert-link">'+company.companyName+'</a>';
					logMessage += 'check your <a href="/h/'+params.houseId+'/p/'+params.postId+'" class="check-post alert-link">post</a></div>';
				log.writeLog(post.writer,logMessage);
				post.offers.unshift(offer);
				post.save(function(err){
					if(err){
						done(err)
					}else{
						res.json({
							'status' : 'success'
						})
					}
				})
			}
		],function(err){
			if(err){ return next(err)};
		})

	}else{
		// user is not company owner.
		return res.status(400).send({
			message: 'You are not company owner'
		});
	}
}

exports.acceptOffer = function(req, res){
	var user = req.user;
	var offerId = req.body.offerId;
	var postId = req.body.postId;
	var logMessage = '';
	Post.findOne({
		'_id' : postId,
		'writer' : user._id
	},function(err, post){
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{

			if(post){
				post.offers.forEach(function(offer){
					if(offer._id == offerId){
						offer.status = 'Accepted';
						post.wanted.status = 'Closed';
						post.wanted.reason = 'House\'s owner took an offer';
						logMessage = '<div class="alert alert-success log"> <span> User <b>accepted</b> your offer </span>';
						logMessage += '<span> check the </span>';
						logMessage += '<a href="/h/'+post.house+'/p/'+post._id+'" class="alert-link check-post">post</a></div>';
					}else if(offer._id !=offerId && offer.status =='Submitted'){
						offer.status = 'Declined';
						offer.reason = 'House\'s owner took the other offer'; 
						
						logMessage = '<div class="alert alert-warning log"> <span> User <b>declined</b> your offer </span>';
						logMessage += '<span> check the </span>';
						logMessage += '<a href="/h/'+post.house+'/p/'+post._id+'" class="alert-link check-post">post</a>';
						logMessage += '<p><b>Reason</b> : <span class="reason">'+offer.reason+'</span></p></div>';
					}
					companyLog.writeLog(offer.company,logMessage);
				});
				post.edit.editable = false;
				post.edit.removable = false;

			
				post.save(function(err){
					if(err){

					}else{
						res.json({
							'status' : 'success'
						})
					}
				})

			}else{
				// post is not exist.
				return res.status(400).send({
					message: 'cannot find a post'
				});
			}
		}
	})
}


exports.declineOffer = function(req, res){
	var user = req.user;
	var offerId = req.body.offerId;
	var postId = req.body.postId;
	var reason = req.body.reason;
	var logMessage = '';
	
	Post.findOne({
		'_id' : postId,
		'writer' : user._id
	},function(err, post){

		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			if(post){
				post.offers.forEach(function(offer){
					if(offer._id == offerId){
						offer.status = 'Declined';
						if(reason){
							offer.reason = reason;
						}else{
							offer.reason = 'House\'s owner declined this offer'; 
						}
						logMessage = '<div class="alert alert-warning log"> <span> User <b>declined</b> your offer </span>';
						logMessage += '<span> check the </span>';
						logMessage += '<a href="/h/'+post.house+'/p/'+post._id+'" class="alert-link check-post">post</a>';
						logMessage += '<p><b>Reason</b> : <span class="reason">'+offer.reason+'</span></p></div>';
						companyLog.writeLog(offer.company,logMessage);
					}
				})
			}else{
				// post is not exist
				return res.status(400).send({
					message: 'post is not exist'
				});
			}
		}

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
	})

}
