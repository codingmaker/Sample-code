'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PaymentSchema = new Schema({
	id : String,
	user: {
		type: Schema.Types.ObjectId,
        ref : 'User'
	},
	status : String,
	object : String,
	amount : Number,
	currency : String,
	description : String,
	created : {
		type: Date,
        default: Date.now
	},
	charge : String
});



mongoose.model('Payment', PaymentSchema);
