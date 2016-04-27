'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core.server.controller');

	app.route('/').get(core.index);
	app.route('/c/:id').get(core.renderCompany);

	app.use('/h/:houseId',core.houseMiddleware)
	app.route('/h/:houseId').get(core.renderHouse);
	app.route('/h/:houseId/p/:postId').get(core.renderPost);
		 

	app.route('/about').get(core.about);
	
	// lastSearch
	app.route('/search/findOnMap').get(core.findOnMap);
	app.route('/search/findByAddress').get(core.findByAddress);


	// search
	app.route('/search/getPostByPage').get(core.getPostByPage);
	app.route('/search/getCompanyByPage').get(core.getCompanyByPage);


	app.route('/uploadImage/:target/:id').post(core.uploadImage);
	app.route('/user_asset/:target/:id/:image').delete(core.deleteImage);


	// seo for robots.
	app.route('/sitemap.xml').get(core.generateSitemap);
	app.route('/robots.txt').get(core.sendRobotsTxt);
};
