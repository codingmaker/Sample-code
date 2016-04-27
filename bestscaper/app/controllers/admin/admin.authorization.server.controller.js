var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	Company = mongoose.model('Company'),
	async = require('async');

/**
 * Require login routing middleware
 */

// var loginCode = 'bestSun91Erica';
var loginCode = 'test'


exports.login = function(req, res, next) {
	console.log(req.body);
	if(req.body.password == loginCode){

		req.session.isAdmin = true;

		res.redirect('/admin/p/dashboard');
	}else{
		res.redirect('/admin/login');
	}
};


exports.authAdmin = function(req, res, next){
	console.log(req.session.isAdmin);
	if(req.session.isAdmin){
		next();
	}else{
		res.redirect('/admin/login');
	}
}