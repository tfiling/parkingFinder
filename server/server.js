require('./config/config');

const _ = require('lodash');//utils
const express = require('express');//http request handling
const bodyParser = require('body-parser');//parsing jsons in http request body
const {ObjectID} = require('mongodb');//data base

var {mongoose} = require('./db/mongoose');//ORM for mongodb
var {User} = require('./models/user');//user model
var {authenticate} = require('./middleware/authenticate');//authentication middleware

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());//add middleware for parsing json body

// signup
app.post('/users', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	var user = new User(body);

	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e);
	})
});

//get user's profile
app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

//login - authenticate
app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		res.status(400).send();
	});
});

//logout
app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	});
});

require('./parkingSpaces').addParkingSpaceHandlers(app);

/////////////////////
//google authentication
/*works - an access token is received from google after the user authenticates

var google = require('googleapis');
var request = require('request');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
	process.env.GOOGLE_OAUTH_CLIENT_ID,
	process.env.GOOGLE_OAUTH_CLIENT_SECRET,
	process.env.GOOGLE_OAUTH_REDIRECT_URL
);

app.get('/oauth2callback', (req, res) =>
{
	var code = req.query.code;
	console.log(`code: ${code}`);
	console.log(`***redirection request: \n${req}`);

	oauth2Client.getToken(code, (err, tokens) =>
	{
		if (err) {
			console.log(err);
			res.status(400).send(err);
			return;
		}
		console.log(tokens);
		oauth2Client.setCredentials(tokens);

		google.plus('v1').people.get({
			userId: 'me',
			auth: oauth2Client
		}, function (err, response) {
			console.log(response);
		});

		res.send(tokens);
	});
});
app.get('/signup', (req, res) =>
{

// generate a url that asks permissions for Google+ and Google Calendar scopes
	var scopes = [
		'https://www.googleapis.com/auth/plus.me'
	];

	var url = oauth2Client.generateAuthUrl({
		// 'online' (default) or 'offline' (gets refresh_token)
		access_type: 'offline',

		// If you only need one scope you can pass it as a string
		scope: scopes,

		// Optional property that passes state parameters to redirect URI
		// state: { foo: 'bar' }
	});


	request.get(url, (error, response, body) =>
	{
		console.log(`error: \n ${error}`);
		res.send(body);
	});
});
*/
///////////////////



app.listen(port, () => {
	console.log(`Started up at port ${port}`);
});

module.exports = {app};
