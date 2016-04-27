'use strict';

module.exports = function(app) {
	var admin = require('../../app/controllers/admin.server.controller');

	app.route('/admin/login').get(admin.renderLogin);	
	app.route('/admin/login').post(admin.login);


	// middleware for admin.
	app.use('/admin/p/',admin.authAdmin);
	app.route('/admin/p/dashboard').get(admin.renderDashboard);

	app.route('/admin/p/users').get(admin.renderUser);
	app.route('/admin/p/companies').get(admin.renderCompany);

	app.route('/admin/p/company/removeCompany').post(admin.removeCompany);



};
