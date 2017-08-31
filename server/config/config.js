var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
	var config = require('./config.json');
	var envConfig = config[env];

	Object.keys(envConfig).forEach((key) => {
		process.env[key] = envConfig[key];
	});

	process.env.GOOGLE_APPLICATION_CREDENTIALS = process.cwd() + '\\google_api_client_secret.json';//todo add to heroku
}
