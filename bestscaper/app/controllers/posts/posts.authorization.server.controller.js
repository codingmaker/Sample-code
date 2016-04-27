var _ = require('lodash'),
	config = require('../../../config/config'),
	crypto = require('crypto'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Company = mongoose.model('Company'),
	nodemailer = require('nodemailer'),
	async = require('async');


exports.middleware = function(req, res, next){
	if (!req.isAuthenticated()) {
		return res.render('require_login',{
			title:'Require Login',
			description : config.app.description,
			keywords : config.app.keywords
		})
	}else{
		next();
	}
}

