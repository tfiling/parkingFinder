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
const parkingSpaceIDs = (() => {
	let size = 10;
	var IDArray = [];
	for(i = 0; i < size; i++)
	{
		IDArray.push(new ObjectID());
	}
	return IDArray;
})();
//address property is not saved since it is not mentioned in the schema
const parkingSpacesArray =	[
	new ParkingSpace({
		address: 'burla 31, rishon',
		_id: parkingSpaceIDs[0],
		latitude: 31.976625,
		longitude: 34.768853
	}),
	new ParkingSpace({
		address: 'burla 29, rishon',
		_id: parkingSpaceIDs[1],
		latitude: 31.976556,
		longitude: 34.768803
	}),
	new ParkingSpace({
		address: 'burla 15, rishon',
		_id: parkingSpaceIDs[2],
		latitude: 31.976338,
		longitude: 34.767896
	}),
	new ParkingSpace({
		address: 'ben saruk 14, rishon',
		_id: parkingSpaceIDs[3],
		latitude: 31.975423,
		longitude: 34.773663
	}),
	new ParkingSpace({
		address: 'hagefen 3, rishon',
		_id: parkingSpaceIDs[4],
		latitude: 31.96353,
		longitude: 34.795918
	})
];

const populateParkingSpaces = (done) =>
{
	ParkingSpace.remove({})
		.then(() =>
		{
			parkingSpacesArray.forEach((element) =>
			{
				new ParkingSpace(element).save();
			});
		})
		.then(() =>
		{
			done();
		});
};

module.exports = {users, populateUsers,	parkingSpacesArray, populateParkingSpaces};
