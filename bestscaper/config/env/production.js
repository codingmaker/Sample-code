'use strict';

// email account
var generator = require('xoauth2').createXOAuth2Generator({
    user:"info@bestscaper.com",
    clientId:"179215664516-g6c0stualh5480fnt5tkdnajm6ou20lm.apps.googleusercontent.com",
    clientSecret:"eVcMKu_IDoThsnSuvbvz3Ee7",
    refreshToken:"1/d_2J0ENhJ_9f0eLgiFoyZsvTkVKO3z6qJDDO1VfiqRxIgOrJDtdun6zK6XiATCKT"
});

module.exports = {
	db: {
		uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/bestscaper',
		options: {
			user: '',
			pass: ''
		}
	},
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'combined',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			stream: 'access.log'
		}
	},
	app: {
		appName : 'Bestscaper',
		title: 'Bestscaper - Best offer, Best Landscaping',
		description : 'Get the Best offer, Get the Best Landscaping on your yard with Bestscaper.com',
		keywords : 'landscape, landscaping, landscapers, lawn, lawn care, lawn service, landscaping pictures, landscaping images'
	},
	stripe : {
  		secretKey: 'sk_live_EqIezwNuM7iMk71qwMPxwx91'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || '1525465817702104',
		clientSecret: process.env.FACEBOOK_SECRET || 'caf982fed1a92b52a6884a6e891fd696',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'rojBwn8yPpTjw4WjOaiDD7z06',
		clientSecret: process.env.TWITTER_SECRET || 'f5bWfZs1uA2suivg0KucIfYaYYaLEBVSZwpinJfbetVgJs5jiw',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '20765978665-roj9e7bu674f48n6qec34tmp6099slt9.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'Re-RVoj19Yjbcw1Nd55A7TAC',
		callbackURL: '/auth/google/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'Bestscaper<info@bestscaper.com>',
		options: {
			service: 'Gmail',
			auth: {
				xoauth2: generator
			}
		}
	}
};
