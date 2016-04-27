'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	config = require('../../../config/config'),
	crypto = require('crypto'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	nodemailer = require('nodemailer'),
	async = require('async');

var smtpTransport = nodemailer.createTransport(config.mailer.options);
/**
 * Signup
 */
 
exports.signup = function(req, res, next) {
	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;
	
	async.waterfall([

		// Generate random token
		function(done){
			crypto.randomBytes(20, function(err, buffer) {
				var token = buffer.toString('hex');
				done(err, token);
			});
		},
		function(token, done){
			User.findOne({email : req.body.email})
			.select('email verified')
			.exec(function(err, user){
				// to find email if it is exist, check the verified and update to new user
				if(err){
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}else{
					if(user){
						if(user.verified){
							return res.status(400).send({
								message: 'Email is exist'
							});
						}else{
							User.findOne({
								email : user.email
							})
							.exec(function(err,user){
								if(err){
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								}else{
									user.password = req.body.password;
									user.firstName = req.body.firstName;
									user.lastName = req.body.lastName;
									user.provider = 'local';
									user.displayName = req.body.firstName + ' ' + req.body.lastName;
									user.verificationToken = token;

									user.save(function(err){
										console.log(err);
										done(err , token , user)
									})
								}
							})
						}
						
					}else{
						var user = new User(req.body);
						var message = null;
						// Add missing user fields
						user.provider = 'local';
						user.displayName = user.firstName + ' ' + user.lastName;
						user.verificationToken = token;

						user.save(function(err) {
							console.log(err);
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								// Remove sensitive data before login
								user.password = undefined;
								user.salt = undefined;
							}

							done(err, token, user);
						});
					}
				}
			})
			
		},
		function(token, user, done) {
			res.render('email_templates/signup-verification-email.server.view.html', {
				name: user.displayName,
				appName: config.app.appName,
				url: 'http://' + req.headers.host + '/auth/verify/' + token
			}, function(err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service
		function(emailHTML, user, done) {
			var mailOptions = {
				to: user.email,
				from: config.mailer.from,
				subject: 'Verification Email from ' + config.app.appName,
				html: emailHTML
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				//if mail is successfully sent, login with that account.
				if (!err) {
					req.login(user, function(err) {
						if (err) {
							res.status(400).send(err);
						} else {
							res.json(user);
						}
					});
				} else {
					return res.status(400).send({
						message: 'Failure sending email'
					});
				}

				done(err,user);
			});
		}
	],function(err){
		if (err) return next(err);
	})
};


exports.sendVerificationEmail = function(req, res, next){
	if(req.user){

		var user = req.user;

		async.waterfall([
			// Generate random token
			function(done){
				crypto.randomBytes(20, function(err, buffer) {
					var token = buffer.toString('hex');
					done(err, token);
				});
			},function(token, done){
				user.verificationToken = token;
				user.save(function(err){
					done(err, token, user);
				})
			},function(token, user, done){
				res.render('email_templates/signup-verification-email.server.view.html', {
					name: user.displayName,
					appName: config.app.appName,
					url: 'http://' + req.headers.host + '/auth/verify/' + token
				},function(err, emailHTML) {
					done(err, emailHTML, user);
				})
			},function(emailHTML, user, done) {
				var mailOptions = {
					to: user.email,
					from: config.mailer.from,
					subject: 'Verification Email from ' + config.app.appName,
					html: emailHTML
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					//if mail is successfully sent, login with that account.
					if (!err) {
						res.json({
							'status' : 'success',
							'message' : 'Email has been sent successfully'
						});
					} else {
						return res.status(400).send({
							message: 'Failure sending email'
						});
					}

					done(err,user);
				});
			}

		],function(err){
		if (err) return next(err);
	})
	}else{
		return res.status(400).send({
			message: 'user is not logged'
		});
	}
}

exports.verify = function(req, res, next) {

	User.findOne({
		verificationToken: req.params.token,
	}, '-salt -password').exec(function(err, user){
		if(err){
			
		}else{
			if(!user){
				return res.status(400).send({
					message: 'No match with verificationToken'
				});
			}else{
				// set the verificationToken as Null and user is now verified.
				user.verificationToken = null;
				user.verified = true;
				user.save(function(err){
					if(err){
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					}else{
						// login to the page.
						req.login(user, function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								res.redirect('/');
							}
						});
					}
				});
			}
		}
	})
}
/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err || !user) {
			res.status(400).send(info);
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.json(user);
				}
			});
		}
	})(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	req.logout();
	req.user = null;
	res.redirect('/');
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {

	return function(req, res, next) {

		passport.authenticate(strategy, function(err, user, redirectURL) {
			var redirectTo;
			if(req.header.referrer){
				redirectTo = req.header.referrer;
			}else if(req.headers.referer){
				redirectTo = req.headers.referer;
			}else if(redirectURL){
				redirectTo = redirectURL;
			}else{
				redirectTo = '/'
			}
			if (err || !user) {
				return res.redirect('/');
			}
			req.login(user, function(err) {
				if (err) {
					return res.redirect(req.redirectTo);
				}
				//redirect to where user was .
				return res.redirect(redirectTo);
			});
		})(req, res, next);
	};
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
	if (!req.user) {
		// Define a search query fields
		var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
		var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

		// Define main provider search query
		var mainProviderSearchQuery = {};
		mainProviderSearchQuery.provider = providerUserProfile.provider;
		mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define additional provider search query
		var additionalProviderSearchQuery = {};
		additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define a search query to find existing user with current provider profile
		var searchQuery = {
			$or: [mainProviderSearchQuery, additionalProviderSearchQuery]
		};

		User.findOne(searchQuery, function(err, user) {
			if (err) {
				return done(err);
			} else {
				if (!user) {
					// var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');
					user = new User({
						firstName: providerUserProfile.firstName,
						lastName: providerUserProfile.lastName,
						displayName: providerUserProfile.displayName,
						email: providerUserProfile.email,
						provider: providerUserProfile.provider,
						providerData: providerUserProfile.providerData,
						verified : true
					});

					// And save the user
					user.save(function(err) {
						return done(err, user);
					});
					
				} else {
					return done(err, user);
				}
			}
		});
	} else {
		// User is already logged in, join the provider data to the existing user
		var user = req.user;

		// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
			// Add the provider data to the additional provider data field
			if (!user.additionalProvidersData) user.additionalProvidersData = {};
			user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');

			// And save the user
			user.save(function(err) {
				return done(err, user, '/');
			});
		} else {
			return done(new Error('User is already connected using this provider'), user);
		}
	}
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
	var user = req.user;
	var provider = req.param('provider');

	if (user && provider) {
		// Delete the additional provider
		if (user.additionalProvidersData[provider]) {
			delete user.additionalProvidersData[provider];

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');
		}

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
						res.json(user);
					}
				});
			}
		});
	}
};
