'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');
	
	// users/me
	app.use('/users/me',users.requiresLogin);
	app.route('/users/me/dashboard').get(users.renderDashboard);
	app.route('/users/me/account/password').get(users.renderPassword);
	app.route('/users/me/account/billing').get(users.renderBilling);
	app.route('/users/me/account/email').get(users.renderEmailNotification);

	// email notification setting.
	app.route('/users/account/change_email_notification').post(users.changeEmailNotification);

	app.route('/users/log/remove_log').post(users.removeLog);

	// Setting up the users profile api
	// app.route('/users/me').get(users.me);
	app.route('/users/profile/update').put(users.updateProfile);
	app.route('/users/profile/update_profile_picture').post(users.updateProfilePicture);
	app.route('/users/accounts').delete(users.removeOAuthProvider);

	// Setting up the users password api
	app.route('/users/password/change_password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);
	
	// Setting up the user verify api
	app.route('/auth/verify/:token').get(users.verify);
	app.route('/auth/sendVerificationEmail').put(users.sendVerificationEmail);

	// Setting the facebook oauth routes
	app.route('/auth/facebook').get(passport.authenticate('facebook', {
		scope: ['user_about_me', 'email']
	}));
	app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

	// Setting the google oauth routes
	app.route('/auth/google').get(passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));
	app.route('/auth/google/callback').get(users.oauthCallback('google'));

	// // Setting the twitter oauth routes
	// app.route('/auth/twitter').get(passport.authenticate('twitter'));
	// app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
