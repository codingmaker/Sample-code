var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var photo = new Schema({
    name : String,
    size : Number,
    url : String,
    deleteType : String,
    deleteUrl : String
});

var log = {
    'message' : String,
    'created': {
        type: Date,
        default: Date.now
    }
}

var album = {
        title : String,
        description : String,
        // comment : [],
        // like : [],
        createdAt : {
            type : Date,
            default : Date.now
        },
        photos : [photo]
    }

var review = {
    rating : Number,
    content : String,
    user : {
        type: Schema.Types.ObjectId,
        ref : 'User'
    },
    post : {
        type: Schema.Types.ObjectId,
        ref : 'Post'
    },
    createdAt : {
        type: Date,
        default: Date.now
    }
}

var coverAddress = {
    city : String,
    state : String,
    country : String
}
var subscriber = {
    user : {
        type: Schema.Types.ObjectId,
        ref : 'User'
    },
    subscribedAt : {
        type : Date,
        default : Date.now
    }
}

var companySchema = new Schema({
    id : String,
	companyName : String,
	companyEmail : String,
    companyContactNumber : [{number : String, note : String}],
    coveredAreas : [coverAddress],
	companyAddress : {
        streetNumber : String,
        street : String,
        city : String,
        state : String,
        country : String,
        postalCode : String,
        other : String,
        findAddress : String
    },
    companyLogo : {
        name : String,
        size : Number,
        url : String,
        deleteType : String,
        deleteUrl : String
    },
    reviews : [review],
    subscribers : [subscriber],
	services : [String],
    description : String,
    followers : [String],
	location: {
        'type': {
            type: String, 
            enum: "Point", 
            default: "Point"
        },
        'coordinates' : { 
            type: [Number],
            default: [0,0]
        } 
    },
    seo : {
        title : String,
        keywords : [String],
        description : String,
        changed : {
            type: Boolean,
            default : false
        }
    },
    owner : {
        type: Schema.Types.ObjectId,
        ref : 'User'
    },
    albums: [album],
    logs : [log],
    payment : {
        plan : {
            type : String,
            enum : ['Basic', 'Gold', 'Platinum'],
            default : 'Basic'
        },
        emailed : {
            type : Boolean,
            default:false
        },
        coupon : { // using coupon or not .
            type : Boolean,
            default : false
        },
        usedCoupon : [{code:String, plan:String, period :Date}],
        from :  Date,
        to : Date,
        pay : [{ id : String, startFrom : Date, to : Date, amount : Number, description : String , currency : String}]
    },
    valid : {
        type : Boolean,
        default : true
    },
    categories : [String]

})

companySchema.statics.findUniqueId = function (id, suffix, callback) {
  var _this = this;
  var possibleId = id.toLowerCase() + (suffix || '');

  _this.findOne({
    id: possibleId
  }, function (err, user) {
    if (!err) {
      if (!user) {
        callback(possibleId);
      } else {
        return _this.findUniqueId(id, (suffix || 0) + 1, callback);
      }
    } else {
      callback(null);
    }
  });
};
companySchema.index({location: '2dsphere'});


mongoose.model("Company", companySchema);