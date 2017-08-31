/**
 * Created by gal on 31-Aug-17.
 */

const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {ParkingSpace} = require('./../models/parkingSpace');
var {users, populateUsers, parkingSpacesArray, populateParkingSpaces} = require('./seed/seed');

beforeEach(populateParkingSpaces);

describe('POST /parkingSpaces', () =>
{
	it('should create new parking and return it', (done) =>
	{
		let longitude = 35.123;
		let latitude = 40.123;

		request(app)
			.post('/parkingSpaces')
			.send({longitude, latitude})
			.expect(200)
			.expect((res) =>
			{
				expect(res.body._id).toExist();
				expect(res.body.longitude).toBe(longitude);
				expect(res.body.latitude).toBe(latitude);
			})
			.end((err) =>
			{
				if (err)
				{
					return done(err)
				}

				ParkingSpace.findOne({longitude, latitude})
					.then((parkingSpace) =>
					{
						expect(parkingSpace).toExist();
						expect(parkingSpace.longitude).toBe(longitude);
						expect(parkingSpace.latitude).toBe(latitude);
						done();
					})
					.catch((e) => done(e));
			});
	});
	it('should return 400', (done) =>
	{
		let longitude = "35.123";
		let latitude = 40.123;

		request(app)
			.post('/parkingSpaces')
			.send({latitude})
			.expect(400)
			.expect((res) =>
			{
				expect(res.body._id).toNotExist();
			})
			.end((err) =>
			{
				if (err)
				{
					return done(err)
				}

				ParkingSpace.findOne({longitude, latitude})
					.then((parkingSpace) =>
					{
						expect(parkingSpace).toNotExist();
						done();
					})
					.catch((e) => done(e));
			});
	});
});

describe('DELETE /parkingSpaces', () =>
{
	//delete existing pa
	it('should remove the parking space by id and return the deleted object', (done)=>
	{
		request(app)
			.delete('/parkingSpaces')
			.send({id: parkingSpacesArray[0]._id})
			.expect(200)
			.expect((res) =>
			{
				expect(res === parkingSpacesArray[0]).toBe(true)
			})
		.end((err, res) =>
		{
			if (err)
			{
				done(err);
			}
			ParkingSpace.findOne({id: parkingSpacesArray[0]._id})
				.then((parkingSpace) =>
				{
					expect(parkingSpace).toNotExist();
					done();
				})
				.catch((e) => done(e));
		});
	});
});




