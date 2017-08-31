//populating the test data base
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {User} = require('./../../models/user');
const {ParkingSpace} = require('./../../models/parkingSpace');

//users test data
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
	_id: userOneId,
	email: 'andrew@example.com',
	password: 'userOnePass',
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
	}]
}, {
	_id: userTwoId,
	email: 'jen@example.com',
	password: 'userTwoPass',
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
	}]
}];


const populateUsers = (done) => {
	User.remove({}).then(() => {
		var userOne = new User(users[0]).save();
		var userTwo = new User(users[1]).save();

		return Promise.all([userOne, userTwo])
	}).then(() => done());
};

//parking spaces test data
const parkingSpaceOneID = new ObjectID();
const parkingSpacesArray =	[{
	_id: parkingSpaceOneID,
	longitude: 34.768903,
	latitude: 31.976557
}];

const populateParkingSpaces = (done) =>
{
	ParkingSpace.remove({})
		.then(() =>
		{
			parkingSpaceOne = new ParkingSpace(parkingSpacesArray[0]).save();
			return parkingSpaceOne;
		})
		.then(() =>
		{
			done();
		});
};

module.exports = {users, populateUsers,	parkingSpacesArray, populateParkingSpaces};
