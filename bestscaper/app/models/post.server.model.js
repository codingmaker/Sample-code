var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var offer = {
    company : {
        type: Schema.Types.ObjectId,
        ref : 'Company'
    },
    content : String,
    reviewed : {
        type : Boolean,
        default : false
    },
    status : {
        type : String,
        default : 'Submitted',
        enum : ['Submitted','Accepted','Declined']
    },
    reason : String,
    offeredAt : {
        type: Date,
        default: Date.now
    }
};


var postSchema = new Schema({
	title : String,
	description : String,
    wanted : {
        status : {
            type : String,
            enum : ['Open','Closed'],
            default : 'Open'
        },
        reason : String,
        to : {
        	type: Date,
			default: Date.now
        }

    },
    writer : {
        type: Schema.Types.ObjectId,
        ref : 'User'
    },
    house : {
        type: Schema.Types.ObjectId,
        ref : 'House'
    },
   	posted: {
		type: Date,
		default: Date.now
	},
    offers :[offer],
    view : {
        type : Number ,
        default:0
    },
    edit : {
        count : {
            type : Number,
            default : 0
        },
        editable : {
            type : Boolean,
            default : true
        },
        removable : {
            type : Boolean,
            default : true
        }
    },
    location: {
        'type': {
            type: String, 
            enum: "Point", 
            default: "Point"
        },
        'coordinates': { 
            type: [Number],
            default: [0,0]
        } 
    },
    hide : Boolean,
	address : {
        streetNumber : String,
        street : String,
        city : String,
        state : String,
        country : String,
        postalCode : String,
        other : String,
        findAddress : String
    },
    categories : [String]
	
})

postSchema.index({location: '2dsphere'});

mongoose.model("Post", postSchema);