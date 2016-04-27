'use strict';
/**
 * Module dependencies.
 */
var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	Company = mongoose.model('Company'),
	async = require('async'),
	request = require('request');


exports.updateLogo = function(req, res){
	var company = req.company;
	var newLogo = req.body;
	if(company.companyLogo.name){
		request({
	    	// will be ignored
	    	method: 'DELETE',
	    	uri: company.companyLogo.deleteUrl,
	    	json : true
		},function(err,response,body){
			
		})
	};
	company.companyLogo = {
        'name' : newLogo.name,
        'size' : parseInt(newLogo.size),
        'url' : newLogo.url,
        'deleteType' : newLogo.deleteType,
    	'deleteUrl' : newLogo.deleteUrl,
    };
	
	company.save(function(err){
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


}

exports.addNewAlbum = function(req, res){
	var company = req.company;
	console.log(req.body);
	
	var title = req.body.title;
	var description = req.body.description;
	
	var newAlbum = {
		title : title,
		description : description,
		photos : []
	}
	company.albums.unshift(newAlbum);
	company.save(function(err){

		var albums = company.albums;
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			res.json({
				'status' : 'success',
				'albums' : albums
			})
		}
		
	})
}
exports.editAlbum = function(req, res){
	var company = req.company;

	var title = req.body.title,
		description = req.body.description,
		albumId = req.body.albumId;

	for(var i = 0; i < company.albums.length; i++){
		if(company.albums[i]._id == albumId){
			company.albums[i].title = title;
			company.albums[i].description = description;
		}
	}

	company.save(function(err){

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

}

exports.addNewPhoto = function(req,res){

	var company = req.company;
	var photos = req.body.photos;
	// photo.size = parseInt(photo.size);
	var albumId = req.body.albumId;
	var selectedAlbum;
	for(var i =0; i < company.albums.length; i++){
		if(company.albums[i]._id == albumId){
			photos.forEach(function(photo){
				company.albums[i].photos.push(photo);
				selectedAlbum = company.albums[i];
			})
			break;
		}
	}

	company.save(function(err){
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			res.json({
				'status' : 'success',
				'album' : selectedAlbum
			})
		}
	})
}


exports.removeAlbum = function(req, res){
	var company = req.company;
	var albumId = req.body.albumId;
	var selectedAlbum;
	for(var i = 0; i < company.albums.length; i++){

		if(company.albums[i]._id == albumId){
			selectedAlbum = company.albums[i];
			company.albums.splice(i,1);
		}
	}
	if(selectedAlbum.photos.length > 0){

		//request to delete all image files in the album.
		async.each(selectedAlbum.photos, function(photo, callback){
			request({
		    // will be ignored
		    	method: 'DELETE',
		    	uri: photo.deleteUrl,
		    	json : true
			},function(err,response,body){
				callback();
			})

		}, function(err){
			if(err){
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			company.save(function(err){
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
}
exports.removePhoto = function(req, res){
	var company = req.company;
	var photoId = req.body.photoId;
	var albumId = req.body.albumId;
	var selectedPhoto;
	var selectedAlbum;
	
	for(var i =0; i < company.albums.length; i++){
		if(company.albums[i]._id == albumId){
			for(var j = 0; j < company.albums[i].photos.length; j++){
				if(company.albums[i].photos[j]._id == photoId){
					selectedPhoto = company.albums[i].photos[j];
					company.albums[i].photos.splice(j,1);
					selectedAlbum = company.albums[i];
					break;
				}
			}
		}
	}
	request({
    // will be ignored
    	method: 'DELETE',
    	uri: selectedPhoto.deleteUrl,
    	json : true
	},function(err,response,body){
		// console.log(response);
		// if(body.status){
			company.save(function(err){
				if(err){
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}else{
					res.json({
						'status' : 'success',
						'album' : selectedAlbum
					})
				}
			})
		// }

	})


}