'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
	require('./payments/payments.create.server.controller'),
	require('./payments/payments.refund.server.controller'),
	require('./payments/payments.renew.server.controller'),
	require('./payments/payments.upgrade.server.controller'),
	require('./payments/payments.expire.server.controller'),
	require('./payments/payments.promotion.server.controller')

);
