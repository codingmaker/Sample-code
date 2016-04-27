var _ = require('lodash'),
	config = require('../../../config/config'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	Company = mongoose.model('Company'),
	User = mongoose.model('User'),
	async = require('async'),
	fs = require('fs'),
	path = require("path");


var rmdir = function(dir) {
	
	var list = fs.readdirSync(dir);

	for(var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i]);
		var stat = fs.statSync(filename);
		
		if(filename == "." || filename == "..") {
			// pass these files
		} else if(stat.isDirectory()) {
			// rmdir recursively
			rmdir(filename);
		} else {
			// rm fiilename
			fs.unlinkSync(filename);
		}
	}
	fs.rmdirSync(dir);
};
/**
 * Require login routing middleware
 */

exports.renderCompany = function(req, res, next) {
	
	var nowPage = req.query.page || 1;
	var way = req.query.way;
	var q = req.query.q;
	var perPage = 10;

	var query = { $and : [ {'valid' : true} ] };

	if(way == 'name'){
		query.$and.push({'companyName' : q});
	}else if(way == 'email'){
		query.$and.push({'companyEmail' : q});
	}else if(way == 'address'){
		query.$and.push({'companyAddress.findAddress': q });
	}



	Company.count(query,function(err, n){
		Company.find(query)
		.skip((nowPage - 1) * perPage)
		.limit(perPage)
		.exec(function(err, companies){
			res.render('pages/admin/company',{
				companies : companies,
				count : n
			});

		})
		
	})
	
};


exports.removeCompany = function(req, res ,next){

	var companyId = req.body.companyId;
	console.log(companyId);
	
	async.waterfall([
		function(done){
			Company.findOne({
				'_id' : companyId
			},function(err,company){
				var dirPath = path.resolve(__dirname + '/../../../public/user_asset/company/'+company._id+'/' ) 
				company.description = 'This company no longer exists';
				company.companyContactNumber = [];
				company.companyEmail = '';
				company.companyAddress = null;
				company.valid = false;
				company.albums = [];

				company.save(function(err){
					fs.exists(dirPath, function(exists){
						if(exists){
							rmdir(dirPath)
						}
						done(err, company.owner);

					})
				})
				
			})
		},function(owner,done){
			console.log('stage 2');
			User.findOne({
				_id : owner
			},function(err,user){
				user.roles.splice(user.roles.indexOf('company'),1);
				user.save(function(err,user){
					res.json({
						'status' : 'success'
					})
				});

			})
		}
	])


}