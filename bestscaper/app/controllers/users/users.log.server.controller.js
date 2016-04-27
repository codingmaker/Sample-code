'use strict';
var mongoose = require('mongoose'),
User = mongoose.model('User'),
errorHandler = require('../errors.server.controller');



exports.writeLog = function(user, message){
	User.findOne({'_id' : user},function(err,user){
		var log = {
			message : message
		}
		user.logs.unshift(log);
		user.save(function(err){

		});
	})
};

exports.removeLog = function(req, res){
	var logId = req.body.logId;

	if (req.user) {
		User.findOne({'_id':req.user._id}, function(err, user) {
			if (!err && user) {
				for(var i =0; i < user.logs.length; i++){
					if(user.logs[i]._id == logId){
						user.logs.splice(i,1);
						break;
					}
				}
				user.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					}else{
						req.login(user, function(err) {
							if (err) {
								res.status(400).send(err);
							}else{
								res.json({
									'status':'success',
									'logCount' : user.logs.length
								})
							}
						});
					}
				});
				

			}else{
				res.status(400).send({
					message: 'User is not found'
				});
			}
		})
	}else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
}