'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var posts = require('../../app/controllers/posts.server.controller');


	// middle ware for route
	
	app.use('/users/me/post',posts.middleware);
	app.route('/users/me/post/:page').get(posts.renderPost);
	app.route('/users/me/post/:post/edit_post').get(posts.renderEditPost);

	app.route('/users/me/post/save_post').post(posts.savePost);
	app.route('/users/me/post/edit_post').post(posts.editPost);
	app.route('/users/me/post/remove_post').post(posts.removePost);



	app.route('/h/:houseId/p/:postId/add_offer').post(posts.addOffer);


	// offers
	app.route('/users/me/post/accept_offer').post(posts.acceptOffer);
	app.route('/users/me/post/decline_offer').post(posts.declineOffer);
	

	
	

	
	//review
	// app.route('/users/me/post/write_review').post(posts.declineOffer);


	// app.route('/users/me/post/:page').get(houses.myHouse);
	// app.route('/users/me/post/write_post').post(houses.addHouse);
	// app.route('/users/me/post/edit_post/:id').post(houses.savePost);
	// app.route('/users/me/post/update_house/:id').post(houses.updateHouse);


	
};
