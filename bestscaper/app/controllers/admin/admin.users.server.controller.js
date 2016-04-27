var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	async = require('async'),
	moment = require('moment');


/**
 * Require login routing middleware
 */

exports.renderUser = function(req, res, next) {
	
	var nowPage = req.query.page || 1;
	var email = req.query.email;
	var perPage = 10;
	var query = {};

	User.count(query,function(err, n){
		console.log(n);
		User.find(query)
		.skip((nowPage - 1) * perPage)
		.limit(perPage)
		.exec(function(err, users){
			console.log(users);
			
			res.render('pages/admin/user',{
				users : users,
				count : n,
				moment : moment
			});

		})
		
	})
	
};
