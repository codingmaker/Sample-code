'use strict';

module.exports = {
	db: {
		uri: 'mongodb://localhost/project',
		options: {
			user: '',
			pass: ''
		}
	},
	port: 3001,
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
		title: 'MEAN.JS - Test Environment'
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
		clientID: process.env.GOOGLE_ID || '59050474339-sqvj80tstttd0n4ap56s3jtmv1gjkdp0.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'xPqf9Uvc0wdOAb7B0jIgxqtL',
		callbackURL: '/auth/google/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'Project<codingmaker@gmail.com>',
		options: {
			service: 'Gmail',
			auth: {
				xoauth2: generator
			}
		}
	}
};
