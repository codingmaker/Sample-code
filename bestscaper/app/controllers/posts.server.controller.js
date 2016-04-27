'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
	require('./posts/posts.authorization.server.controller'),
	require('./posts/posts.core.server.controller'),
	require('./posts/posts.edit.server.controller'),
	require('./posts/posts.search.server.controller'),
	require('./posts/posts.offer.server.controller')

);
