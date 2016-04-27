'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
	require('./houses/houses.authentication.server.controller'),
	require('./houses/houses.core.server.controller'),
	require('./houses/houses.edit.server.controller'),
	require('./houses/houses.search.server.controller')


	
);
