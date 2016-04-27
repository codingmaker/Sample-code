'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var houses = require('../../app/controllers/houses.server.controller');
	var users = require('../../app/controllers/users.server.controller');


	// middle ware for route
	
	app.use('/users/me/house',houses.middleware);
	app.route('/users/me/house/select_house').get(houses.renderSelectHouse);
	app.route('/users/me/house/add_house').post(houses.addHouse);
	// app.route('/users/me/house/save_post/:id').post(houses.savePost);

	// edit middle ware .
	app.use('/users/me/house/:id/edit_house',houses.editMiddleware);
	app.route('/users/me/house/:id/edit_house').get(houses.renderEditHouse);
	app.route('/users/me/house/:id/edit_house/update_house').post(houses.updateHouse);

	// edit  - > photo
	app.route('/users/me/house/:id/edit_house/update_main_photo').post(houses.updateMainPhoto);
	app.route('/users/me/house/:id/edit_house/update_photos').post(houses.updatePhotos);
	
	// remove Photo
	app.route('/users/me/house/:id/edit_house/remove_main_photo').post(houses.removeMainPhoto);
	app.route('/users/me/house/:id/edit_house/remove_photo').post(houses.removePhoto);

	
};
