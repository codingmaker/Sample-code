'use strict';
var mongoose = require('mongoose'),
Company = mongoose.model('Company'),
errorHandler = require('../errors.server.controller');


exports.writeLog = function(companyId, message){
	Company.findOne({'_id' : companyId},function(err,company){
		var log = {
			message : message
		}
		company.logs.unshift(log);
		company.save(function(err){

		});
	})
};

exports.removeLog = function(req, res){
	var logId = req.body.logId;
	
	if (req.user) {
		Company.findOne({'_id':req.company._id}, function(err, company) {
			console.log(company);

			if (!err && company) {
				
				for(var i =0; i < company.logs.length; i++){
					if(company.logs[i]._id == logId){
						company.logs.splice(i,1);
						break;
					}
				}

				company.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					}else{
						
						res.json({
							'status' : 'success',
							'logCount' : company.logs.length
						})
						
					}
				});
				

			}else{
				res.status(400).send({
					message: 'Company is not found'
				});
			}
		})
	}else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
}