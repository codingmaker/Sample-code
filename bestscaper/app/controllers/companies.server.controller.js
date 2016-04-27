'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
	require('./companies/companies.authentication.server.controller'),
	require('./companies/companies.authorization.server.controller'),
	require('./companies/companies.core.server.controller'),
	require('./companies/companies.log.server.controller'),
	require('./companies/companies.photo.server.controller'),
	require('./companies/companies.review.server.controller'),
	require('./companies/companies.search.server.controller'),
	require('./companies/companies.setting.server.controller'),
	require('./companies/companies.subscriber.server.controller')

);
