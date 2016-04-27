'use strict';

module.exports = function(app) {
	// Root routing
	var companies = require('../../app/controllers/companies.server.controller');
	var payments = require('../../app/controllers/payments.server.controller');
	var contacts = require('../../app/controllers/contacts.server.controller');



	// company setting middle ware.
	app.use('/companies/my_company/',companies.requiresLogin);
	app.use('/companies/my_company/',companies.requiresRole);
	app.use('/companies/my_company/',companies.checkCompanyOwner);

	app.route('/companies/my_company/:page').get(companies.myCompany);
	app.route('/companies/my_company/album/select_album').get(companies.rednerSelectAlbum);
	app.route('/companies/my_company/album/edit_album/:album').get(companies.rednerEditAlbum);

	// add new company
	app.route('/companies/add_company').post(companies.addCompany);
		
	// setting.
	app.route('/companies/my_company/setting/update_basic').post(companies.updateBasic);
	app.route('/companies/my_company/setting/update_advanced').post(companies.updateAdvanced);
	app.route('/companies/my_company/setting/update_marketing').post(companies.updateMarketing);
	// logo
	app.route('/companies/my_company/setting/update_logo').post(companies.updateLogo);

	//subscribers.
	app.route('/companies/subscriber/add_subscriber').post(companies.addSubscriber);
	app.route('/companies/subscriber/remove_subscriber').post(companies.removeSubscriber);
	app.route('/companies/my_company/subscriber/send_email').post(companies.sendEmail);


	// reviews
	app.route('/companies/review/write_review').post(companies.writeReview);

	// log
	app.route('/companies/my_company/log/remove_log').post(companies.removeLog);


	// photo
	app.route('/companies/my_company/photo/add_new_album').post(companies.addNewAlbum);
	app.route('/companies/my_company/photo/add_new_photo').post(companies.addNewPhoto);
	app.route('/companies/my_company/photo/edit_album').post(companies.editAlbum);
	app.route('/companies/my_company/photo/remove_photo').post(companies.removePhoto);
	app.route('/companies/my_company/photo/remove_album').post(companies.removeAlbum);


	// payments
	app.route('/companies/my_company/payments/create').post(payments.createPayment);
	app.route('/companies/my_company/payments/refund').post(payments.refundPayment);
	app.route('/companies/my_company/payments/renew').post(payments.renewPayment);
	app.route('/companies/my_company/payments/upgrade').post(payments.upgradePayment);

	// promotion code 
	app.route('/companies/my_company/payments/promotion_code').post(payments.usePromotionCode);


	// contact
	app.route('/companies/contact/create_contact').post(contacts.createContact);


};
