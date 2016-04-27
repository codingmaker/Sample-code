var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	Company = mongoose.model('Company'),
	async = require('async');

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.render('require_login',{
			title:'Require Login',
			description : config.app.description,
			keywords : config.app.keywords
		})
	}else{
		next();
	}
};


exports.requiresRole = function(req, res, next) {
	if(req.user.roles.indexOf('company') != -1){
		next();
	}else{
		res.redirect('/');
	}
};

exports.checkCompanyOwner = function(req, res, next){
	Company.findOne({
		$and : [
			{'owner' : req.user._id},
			{'valid' : true}
		]
	})
	.select('-subscribers')
	.exec(function(err, company){
			if(err){
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}else{
				if(company){
					req.company = company;
					next();
				}else{
					// we cannot find company via user session. 
					// 
				}
			}	
		}
	)
		
}
