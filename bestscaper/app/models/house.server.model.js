var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var photo = new Schema({
    name : String,
    size : Number,
    deleteType : String,
    deleteUrl : String,
    url : String
});
var houseSchema = new Schema({
	title : String,
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
    email : String,
    contactNumber : String,
	serviceType : String,
    mainPhoto : {
        name : String,
        size : Number,
        url : String,
        deleteType : String,
        deleteUrl : String
    },
    photos : [photo], 
    wanted : {
        status : {
            type : String,
            default : 'OFF'
        }
    },
    owner : {
        type: Schema.Types.ObjectId,
        ref : 'User'
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
    createdAt : {
        type: Date,
        default: Date.now
    }
})

houseSchema.index({location: '2dsphere'});


mongoose.model("House", houseSchema);