'use strict';
/**
 * Module dependencies.
 */
var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	Post = mongoose.model('Post'),
	User = mongoose.model('User'),
	Company = mongoose.model('Company'),
	House = mongoose.model('House'),
	async = require('async'),
	moment = require('moment');

exports.myCompany = function(req, res){
	var company = req.company;
	var user = req.user;
	var page = req.params.page;

	switch(page){
		case 'offers' : 
		renderOffers(user,company,res);
		break;

		case 'dashboard' : 
		renderDashboard(user,company,res);
		break;

		case 'setting' : 
		rednerSetting(user,company,res);
		break;

		case 'subscribers' : 
		renderSubscribers(user, company,req, res);
		break;

		default : 
		res.render('404page.html', {
		    title : 'We cannot find the page',
		    keywords : config.app.keywords,
		    description : config.app.description,
		    user : req.user
		});
	}
}
var renderSubscribers = function(user, company, req, res){
	var nowPage = req.query.p || 1;
	var perPage = 10;
	Company.aggregate([
		{
			$match : {$and : [ { owner : user._id}, {valid : true} ]}
		},
		{
			$unwind : "$subscribers"
		},
		{
			$project : {"subscribers" : 1 , "_id" : -1}
		}
	],function(err, subscribers){

		User.populate(subscribers,[{path:'subscribers.user', model:'User', select:'-_id firstName lastName email contactNumber houses'}],function(err, subscribers){
			House.populate(subscribers,[{path:'subscribers.user.houses', model:'House',select:'-_id address'}], function(err,subscribers){
				var availablePage = Math.ceil( subscribers.length / perPage );
				res.render('pages/my_company/subscribers', {
					title : 'My Company :: ' + company.companyName,
					description : config.app.description,
					keywords : config.app.keywords,
					user : user,
					company: company,
					subscribers: subscribers.splice( (nowPage-1) * perPage , perPage),
					nowPage : nowPage,
					perPage : perPage,
					availablePage : availablePage
				});
				
			})
		})
		

	});

	
}
var renderOffers = function(user,company,res){


	
	Post.aggregate([
		{
			'$unwind' : '$offers'
		},
		{
			'$match' : { 'offers.company' : company._id}
		}
	],function(err,offers){
		res.render('pages/my_company/offers',{
			title : 'My Company :: ' + company.companyName,
			description : config.app.description,
			keywords : config.app.keywords,
			user : user,
			company : company,
			offers : offers,
			moment : moment
		})
	})
}

var renderDashboard = function(user,company,res){
	switch(company.payment.plan){
		case 'Basic' : 
		res.render('pages/my_company/dashboard/basic', {
			title : 'My Company :: ' + company.companyName,
			description : config.app.description,
			keywords : config.app.keywords,
			user : user,
			company: company,
			moment : moment
		});
		break;
		case 'Gold' : 
		res.render('pages/my_company/dashboard/gold', {
			title : 'My Company :: ' + company.companyName,
			description : config.app.description,
			keywords : config.app.keywords,
			user : user,
			company: company,
			moment : moment
		});
		break;
		case 'Platinum' : 
		res.render('pages/my_company/dashboard/platinum', {
			title : 'My Company :: ' + company.companyName,
			description : config.app.description,
			keywords : config.app.keywords,
			user : user,
			company: company,
			moment : moment
		});
		break;
		
	}

	// res.render('pages/my_company/dashboard/basic', {
	// 	title : 'My Company :: ' + company.companyName,
	// 	description : config.app.description,
	// 	keywords : config.app.keywords,
	// 	user : user,
	// 	company: company
	// });
}

var rednerSetting = function(user,company,res){
	res.render('pages/my_company/setting', {
		title : 'My Company :: ' + company.companyName,
		description : config.app.description,
		keywords : config.app.keywords,
		user : user,
		company: company
	});
}

exports.rednerSelectAlbum = function(req,res,next){
	var company = req.company;
	var user = req.user;

	res.render('pages/my_company/album/select_album', {
		title : 'My Company :: ' + company.companyName,
		description : config.app.description,
		keywords : config.app.keywords,
		user : user,
		company: company,
		moment : moment
	});
	
}
exports.rednerEditAlbum =function(req,res,next){
	var company = req.company;
	var user = req.user;
	var albumId = req.params.album;
	var albums = company.albums;
	var selectedAlbum;

	company.albums.forEach(function(album){
		if(album._id == albumId){
			return selectedAlbum = album;
		}
	})
	
	
	res.render('pages/my_company/album/edit_album', {
		title : 'My Company :: ' + company.companyName,
		description : config.app.description,
		keywords : config.app.keywords,
		user : user,
		company: company,
		album : selectedAlbum,
		moment : moment
	});


}
