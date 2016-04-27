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
	Post = mongoose.model('Post'),
	House = mongoose.model('House'),
	async = require('async'),
	moment = require('moment');

exports.renderPost = function(req, res){
	var page = req.params.page;
	
	if(page == 'select_post'){
		Post.find({
			writer : req.user._id
		}).populate('house').sort('-posted').exec(function(err,posts){
			if(err){
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}else{
				res.render('pages/me/post/select_post', {
					title : 'select your post',
					description : config.app.description,
					keywords : config.app.keywords,
					user : req.user,
					moment : moment,
					posts : posts
				});
			}
		})
		
	}else if(page == 'write_post'){

		House.find({'owner' : req.user._id })
		.exec(function(err, houses){
			if(err){
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}else{
				if(houses.length === 0 ){
					res.redirect('/users/me/house/select_house')
				}else{
					res.render('pages/me/post/write_post', {
						title : 'write post',
						description : config.app.description,
						keywords : config.app.keywords,
						user : req.user,
						moment : moment,
						houses : houses
					});
				}
				
			}
		})
	}

}
exports.renderEditPost = function(req, res, next){
	var postId = req.params.post;
	
	Post.findOne({
		'_id' : postId,
		'writer' : req.user._id
	},function(err,post){
		if(err){
			return res.status(400).render('error',{
				title : 'There is something wrong',
				description : config.app.description,
				keywords : config.app.keywords,
				user : req.user,
				message : 'There is something wrong'
			})
		}else{

			if(post){
				if(!post.edit.editable){
					return res.status(400).render('error',{
						title : 'This post is not editable',
						description : config.app.description,
						keywords : config.app.keywords,
						user : req.user,
						message : 'This post is not editable'
					})
				}else{
					res.render('pages/me/post/edit_post', {
						title : 'write post',
						description : config.app.description,
						keywords : config.app.keywords,
						user : req.user,
						moment : moment,
						post : post
					});
				}
			}else{
				return res.status(400).render('error',{
					title: 'We cannot find this post',
					description : config.app.description,
						keywords : config.app.keywords,
						user : req.user,
					message: 'We cannot find this post'
				});

			}
		}
		

	})
		
		

}
