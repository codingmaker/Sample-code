var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var contactSchema = new Schema({
	email : String,
	contactNumber : String,
	firstName : String,
	lastName : String,
	title : String,
	message : String,
	company : {
		type: Schema.Types.ObjectId,
        ref : 'Company'
	},
	user : {
		type: Schema.Types.ObjectId,
        ref : 'User'
	},
	contactedAt : {
        type: Date,
        default: Date.now
    }
});

mongoose.model("Contact", contactSchema);