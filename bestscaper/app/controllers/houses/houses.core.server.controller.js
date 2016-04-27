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
	nodemailer = require('nodemailer'),
	async = require('async'),
	moment = require('moment');

exports.middleware = function(req, res, next){
	if (!req.isAuthenticated()) {
		return res.render('require_login',{
			title:'Require Login',
			keywords : config.app.keywords,
			description : config.app.description
		})
	}else{
		House.find({'owner' : req.user._id })
		.exec(function(err, houses){
			if(err){
				
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}else{
				req.houses = houses;
				next();
			}
			
		})
	}
}

exports.editMiddleware = function(req,res, next){
	var houseId = req.params.id;
	House.findOne({'_id' : houseId })
	.exec(function(err, house){
		if(err){
			
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			req.house = house;
			next();
		}
		
	});
}
exports.renderSelectHouse = function(req, res){
	var houses = req.houses;
	
	res.render('pages/me/house/select_house', {
		title : 'Bestscaper : Select house',
		description : config.app.description,
		keywords : config.app.keywords,
		user : req.user,
		houses: houses,
		moment : moment
	});

}

exports.renderEditHouse = function(req, res){
	var house = req.house;
	console.log(house);
	res.render('pages/me/house/edit_house', {
		title : 'Bestscaper : User profile setting',
		description : config.app.description,
		keywords : config.app.keywords,
		user : req.user,
		house: house,
		moment : moment
	});

}

