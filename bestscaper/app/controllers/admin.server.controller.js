'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
	require('./admin/admin.core.server.controller'),
	require('./admin/admin.authorization.server.controller'),
	require('./admin/admin.users.server.controller'),
	require('./admin/admin.companies.server.controller')



);
