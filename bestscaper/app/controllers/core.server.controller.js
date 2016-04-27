'use strict';

/**
 * Module dependencies.
 */
 var errorHandler = require('./errors.server.controller'),
 	companySearch = require('./companies/companies.search.server.controller'),
 	postSearch = require('./posts/posts.search.server.controller'),
 	config = require('../../config/config'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Company = mongoose.model('Company'),
	nodemailer = require('nodemailer'),
	House = mongoose.model('House'),
	Post = mongoose.model('Post'),
	async = require('async'),
	moment = require('moment'),
	fs = require('fs'),
	sm = require('sitemap');


var smtpTransport = nodemailer.createTransport(config.mailer.options);


exports.houseMiddleware = function(req, res, next){
	var houseId = req.params.houseId;
	
	async.waterfall([
		function(done){
			Post.find({ house : houseId}).sort('-posted').exec(function(err,posts){
				done(err,posts);
			})
		},function(posts,done){
			House.findOne({'_id' : houseId}).populate('owner').exec(function(err,house){
				if(err){
					return next(err);
				}else{
					
					if(house){
						req.posts = posts;
						req.house = house;	
						next();
					}else{
						return res.status(500).render('error',{
							title : 'We cannot find this house.',
							message : 'We cannot find this house',
							keywords : config.app.keywords,
							description : config.app.description,
							user : req.user
						});
					}
				}
			})
		}
	],function(err){
		if (err) return next(err);
	})
	
}



exports.index = function(req, res) {
	var pPage = req.query.pPage || 1 ;
	var cPage = req.query.cPage || 1 ;
	var address = {};
		
	if(req.query.country){
		address.country = req.query.country;
	}
	if(req.query.state){
		address.state = req.query.state;
	}
	if(req.query.city){
		address.city = req.query.city;
	}

	async.waterfall([
		function(done){
			postSearch.findByAddress(pPage,address,function(postResult){
				done(null, postResult);
			});
		},function(postResult, done){
			
			companySearch.findByAddress(cPage,address,function(companyResult){
				
				
				res.render('index',{
					'title' : config.app.title,
					'keywords' : config.app.keywords,
					'description' : config.app.description,
					'user' : req.user,
					'status' : 'success',
					'companyResult' : companyResult,
					'postResult' : postResult,
					'search' : true,
					'moment' : moment
				});

			})
		}

	])

};

exports.findByAddress = function(req,res){
	var address = req.query;
	
	var pPage = req.query.pPage || 1 ;
	var cPage = req.query.cPage || 1 ;
	
	async.waterfall([
		function(done){
			postSearch.findByAddress(pPage,address,function(postResult){
				done(null,postResult);
			})

		},function(postResult,done){
			companySearch.findByAddress(cPage,address,function(companyResult){
				
				res.json({
					'status' : 'success',
					'companyResult' : companyResult,
					'postResult' : postResult
				})
			})
			
		}

	])
}
exports.getPostByPage = function(req, res){
	var pPage = req.query.pPage || 1 ;
	var address = {};

	if(req.query.country){
		address.country = req.query.country;
	}
	if(req.query.state){
		address.state = req.query.state;
	}
	if(req.query.city){
		address.city = req.query.city;
	}

	postSearch.findByAddress(pPage,address,function(postResult){
		res.json({
			'status' : 'success',
			'postResult' : postResult
		})
	})
}
exports.getCompanyByPage = function(req, res){
	var cPage = req.query.cPage || 1 ;
	var address = {};

	if(req.query.country){
		address.country = req.query.country;
	}
	if(req.query.state){
		address.state = req.query.state;
	}
	if(req.query.city){
		address.city = req.query.city;
	}
	companySearch.findByAddress(cPage,address,function(companyResult){
				
		res.json({
			'status' : 'success',
			'companyResult' : companyResult
		})
	})
}
exports.findOnMap = function(req, res){
	
	var coordinates = [ parseFloat(req.query.lat) , parseFloat(req.query.lng) ];
	var zoom = parseInt(req.query.zoom);
	

	// option.maxDistance = option.maxDistance * multi;
	console.log("on the map");
	async.waterfall([
		function(done){
			postSearch.findByLocation(coordinates,function(houses){
				done(null, houses);
			})
		},
		function(houses,done){
			
			companySearch.findByLocation(coordinates,function(companies){
				console.log(companies);
				res.json({
					'status' : 'success',
					'companies' : companies,
					'houses' : houses
				});

			})
		}
	])
}


exports.renderCompany = function(req, res) {
	var user = req.user;
	var title ='';
	var description = '';
	var keywords = '';

	var subscribed = false;

	Company.findOne({ "id" : req.params.id})
	.populate('reviews.user reviews.post')
	.exec(function(err,company){
		if(err){
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}else{
			if(company){
				
				if(user){
					for(var i = 0; i < company.subscribers.length; i++){
						
						if(company.subscribers[i].user.toString() === user._id.toString()){
							console.log('hohohohohohoh');
							subscribed = true;
							break;
						}
					}
				}
				title = company.seo.title + ' | Bestscaper.com';
				description = company.seo.description;
				var keywordLength = company.seo.keywords.length;
				for(var i = 0; i < keywordLength; i++){
					keywords += company.seo.keywords[i]
					if( i != keywordLength - 1){
						keywords += ',';
					}
				}
				
				// get landscaper page information and render it.
				res.render('pages/company/index', {
					title : title,
					description : description,
					keywords : keywords,
					user : user,
					company : company,
					moment : moment,
					subscribed : subscribed
				});
			}else{
				//there is no company we need error handler; 404 but our hompage.
				res.render('404page.html', {
				    title : 'We cannot find the page',
				    keywords : config.app.keywords,
				    description : config.app.description,
				    user : req.user
				});
			}
			

		}
	})
	

	
};

exports.renderHouse = function(req, res) {
	
	if(req.house){
		// get landscaper page information and render it.
		res.render('pages/house/index', {
			title : req.house.title,
			keywords : config.app.keywords,
			description : config.app.description,
			user : req.user,
			house : req.house,
			posts : req.posts,
			moment : moment
		});
	}else{
		//there is no company we need error handler; 404 but our hompage.
		return res.status(404).send({
			message: 'We cannot find the page'
		});
	}
	
};

exports.renderPost = function(req,res){
	var postId = req.params.postId;
	
	async.waterfall([
		function(done){
			Post.findOne({'_id' : postId}).populate('writer offers.company').exec(function(err,post){
				if(post){
					done(err,post);	
				}else{
					res.status(500).render('pages/house/no_post',{
						title : 'We cannot find the post.',
						keywords : config.app.keywords,
						description : config.app.description,
						user : req.user,
						house : req.house,
						posts : req.posts,
						moment : moment

					})
				}
			})
		},
		function(post,done){
			if(post){
				// increase the view counter if readPost session is empty.
				if(req.session.readPost){
					if(req.session.readPost.indexOf(postId) == -1 ){
						post.view = post.view + 1 ;
						req.session.readPost.push(postId);
					}
				}else{
					req.session.readPost = [postId];
					post.view = post.view + 1;
				}
				console.log(moment() > post.wanted.to)
				//when post is expired, to change the status into 'OFF'
				if(moment() > post.wanted.to && post.wanted.status == 'Open'){
					post.wanted.status = 'Closed';
					post.reason = 'Expired';
					post.edit.editable = false;
					
					if(post.writer.emailNotification.expire){
						res.render('email_templates/post-expired-email.server.view.html', {
			                appName: config.app.appName,
			                post : post,
			                name : post.writer.firstName + ' ' + post.writer.lastName
			            },function(err, emailHTML) {
			            	var mailOptions = {
			                    to: post.writer.email,
			                    from: config.mailer.from,
			                    subject: 'Your post has expired',
			                    html: emailHTML
			                };
			                smtpTransport.sendMail(mailOptions);
			            });
					}
				}
				

				post.save(function(err){
					if(err){

					}else{
						res.render('pages/house/post', {
							title : post.title + ' | Bestscaper.com',
							keywords : config.app.keywords,
							description : post.description.substr(0,200),
							user : req.user,
							house : req.house,
							posts : req.posts,
							post : post,
							moment : moment
						});
					}
				})
			}else{
				return res.status(404).send({
					message: 'Cannot find the page'
				});
			}
		}
	])
	

}


exports.about = function(req, res){
	res.render('pages/about/index',{
		title : 'About us',
		keywords : config.app.keywords,
		description : config.app.description,
		user : req.user
	})
}



exports.uploadImage = function(req, res){
	// init the uploader
	// var options = {
	//     tmpDir:  __dirname + '/../../public/user_asset/tmp',
	//     uploadDir: __dirname + '/../../public/user_asset/',
	//     uploadUrl:  '/user_asset/',
	//     maxPostSize: 3200000, // 3mb
	//     minFileSize:  1,
	//     maxFileSize:  3145728, // 3mb
	//     acceptFileTypes:  /.+/i,
	//     // Files not matched by this regular expression force a download dialog,
	//     // to prevent executing any scripts in the context of the service domain:
	//     inlineFileTypes:  /\.(gif|jpe?g|png)/i,
	//     imageTypes:  /\.(gif|jpe?g|png)/i,
	//     copyImgAsThumb : false
	// };
	// // config the uploader
	// var target = req.params.target;
	// var id = req.params.id;

	// options.uploadDir = options.uploadDir + target + '/' + id + '/';
	// options.uploadUrl = options.uploadUrl + target + '/' + id + '/';
	// var uploader = require('blueimp-file-upload-expressjs')(options);
	// uploader.post(req, res, function (error, obj, redirect) {
	// 	console.log(obj);
	//     if(!error){
	//         res.send(JSON.stringify(obj)); 
	//     }
 //    });
}


var deleteOptions = {
    tmpDir:  __dirname + '/../../public/user_asset/tmp',
    uploadDir: __dirname + '/../../public/user_asset/',
    uploadUrl:  '/user_asset/',
    maxPostSize: 3200000, // 3mb
    minFileSize:  1,
    maxFileSize:  3145728, // 3mb
    acceptFileTypes:  /.+/i,
    // Files not matched by this regular expression force a download dialog,
    // to prevent executing any scripts in the context of the service domain:
    inlineFileTypes:  /\.(gif|jpe?g|png)/i,
    imageTypes:  /\.(gif|jpe?g|png)/i,
    copyImgAsThumb : false
};

// var deleteUploader = require('blueimp-file-upload-expressjs')(deleteOptions);

exports.deleteImage = function(req, res){
	deleteUploader.delete(req, res, function (obj) {
		console.log(obj);
        res.send(JSON.stringify(obj));
    });
    
}

exports.generateSitemap = function(req, res){
	
	var sitemap = sm.createSitemap ({
      hostname: 'http://bestscaper.com',
      cacheTime: 600000
    });

	sitemap.add({url: '/', changefreq: 'daily', priority: 0.8});
	
	Company.find({})
	.select('id')
	.exec(function(err, companies){
		companies.forEach(function(company){
			sitemap.add({
				url: '/c/' + company.id,
				changefreq: 'weekly',
				priority: 0.9
			});
		})
		res.header('Content-Type', 'application/xml');
  		res.send(sitemap.toString() );

	})
}

exports.sendRobotsTxt = function(req, res ){
	res.type('text/plain');
    fs.readFile(__dirname + '/../../config/robots.txt','utf8',function(err,text){
    	res.send(text);
    })
}
