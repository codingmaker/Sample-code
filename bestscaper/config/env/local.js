'use strict';

// email account
var generator = require('xoauth2').createXOAuth2Generator({
    user:"bestscaper@gmail.com",
    clientId:"20765978665-roj9e7bu674f48n6qec34tmp6099slt9.apps.googleusercontent.com",
    clientSecret:"Re-RVoj19Yjbcw1Nd55A7TAC",
    refreshToken:"1/wQ_Lcz8Gg18DqwP2Vxs7GoUxq1dRp_uAODRs26c89Eg"
});

module.exports = {
	db: {
		uri: 'mongodb://localhost/bestscaper',
		options: {
			user: '',
			pass: ''
		}
	},
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'dev',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			//stream: 'access.log'
		}
	},
	app: {
		appName : 'Bestscaper',
		title: 'Bestscaper - Best offer, Best Landscaping',
		description : 'Get the Best offer, Get the Best Landscaping on your yard with Bestscaper.com',
		keywords : 'landscape, landscaping, landscapers, lawn, lawn care, lawn service, landscaping pictures, landscaping images'
	},
	stripe : {
  		secretKey: 'sk_test_SZZH8vJdt7UI4pxfnvxACofW'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || '894629970626168',
		clientSecret: process.env.FACEBOOK_SECRET || 'e5ef8e633417003f0d01e6f37a139d40',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'rojBwn8yPpTjw4WjOaiDD7z06',
		clientSecret: process.env.TWITTER_SECRET || 'f5bWfZs1uA2suivg0KucIfYaYYaLEBVSZwpinJfbetVgJs5jiw',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '59050474339-sqvj80tstttd0n4ap56s3jtmv1gjkdp0.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'xPqf9Uvc0wdOAb7B0jIgxqtL',
		callbackURL: '/auth/google/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'Bestscaper<bestscaper@gmail.com>',
		options: {
			service: 'Gmail',
			auth: {
				xoauth2: generator
			}
		}
	}
};
