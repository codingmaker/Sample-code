var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	Company = mongoose.model('Company'),
	async = require('async'),
	moment = require('moment');

/**
 * Require login routing middleware
 */

// var loginCode = 'BestSun91.Erica';
var loginCode = 'test';


exports.renderLogin = function(req, res, next) {
	res.render('pages/admin/login.html');
};

exports.renderDashboard = function(req, res, next) {
	res.render('pages/admin/dashboard.html');
};
