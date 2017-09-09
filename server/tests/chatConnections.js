/**
 * Created by gal on 09-Sep-17.
 */
const expect = require('expect');
const request = require('supertest');
// const {ObjectID} = require('mongodb');//?
const _ = require('lodash');
const {app} = require('./../server');
const {ParkingSpace} = require('./../models/parkingSpace');
const {users, populateUsers} = require('./seed/seed');
const {User} = require('./../models/user');

beforeEach(populateUsers);

describe('GET /chatConnections', () =>
{
	let login = function (user, callback)
	{
		user = _.pick(user, ['_id', 'email', 'password']);
		expect(user.email).toExist();
		expect(user.password).toExist();
		let verifyLogin = async function (err, res)
		{
			if (err) {
				throw new Error(err);
			}
			user = await User.findById(user._id);
			expect(_.findIndex(user.tokens, (o) =>
			{
				return (o.access === 'auth' &&
				o.token === res.headers['x-auth'])
			})).toBeGreaterThanOrEqualTo(0);
			callback(res);
		};
		request(app)
			.post('/users/login')
			.send({
				email: user.email,
				password: user.password
			})
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toExist();
			})
			.end(verifyLogin);
	};

	let logout = async function (user, token, callback)
	{
		user = _.pick(user, ['_id', 'email', 'password']);
		let verifyLogout = async function(err, res)
		{
			if (err) {
				throw new Error(err);
			}

			user = await User.findById(user._id);
			expect(_.findIndex(user.tokens, (o) =>
			{
				return (o.access === 'auth' &&
				o.token === res.headers['x-auth'])
			})).toBe(-1);
			callback(res);
		};
		request(app)
			.delete('/users/me/token')
			.set('x-auth', token)
			.expect(200)
			.end(verifyLogout);

	};

	it('should return a valid websocket session on valid ', async (done) =>
	{
		login(users[0], loginResponse =>
		{
			let token = loginResponse.headers['x-auth'];
			request(app)
				.get('/chatConnections')
				.set('x-auth', token)
				.expect(200)
				.expect((res) => {
					let chatConnectionUrl = res.body.ChatConnection;
					expect(chatConnectionUrl).toExist();
					expect(chatConnectionUrl).toBeA(String);
					expect(chatConnectionUrl.indexOf('ws://')).toBe(0);
				})
				.end((err, res) => {
					if (err) {
						done(err)
					}
					else {
						done();
					}
				});
		});
	});

	it('should return 400 for logged out user', (done) =>
	{
		login(users[0], loginResponse =>
		{
			let token = loginResponse.headers['x-auth'];
			logout(users[0], token, logoutResponse =>
			{
				request(app)
					.get('/chatConnections')
					.set('x-auth', token)
					.expect(400)
					.end((err, res) => {
						if (err) {
							done(err)
						}
						else {
							done();
						}
					});
			});
		});


	});
});