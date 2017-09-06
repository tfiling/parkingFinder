/**
 * Created by gal on 31-Aug-17.
 */

const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const {app} = require('./../server');
const {ParkingSpace} = require('./../models/parkingSpace');
// var {users, populateUsers, parkingSpacesArray, populateParkingSpaces} = require('./seed/seed');
const {parkingSpacesArray, populateParkingSpaces} = require('./seed/seed');
const {SearchResult} = require('./../models/searchResult');

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
	//delete existing parking space
	it('should remove the parking space by id and return the deleted object', (done)=>
	{
		request(app)
			.delete('/parkingSpaces')
			.send({_id: parkingSpacesArray[0]._id})
			.expect(200)
			.expect((res) =>
			{
				expect(res.body._id).toBe(parkingSpacesArray[0]._id.toString());
			})
			.end((err, res) =>
			{
				if (err)
				{
					return done(err);
				}
				ParkingSpace.findOne({_id: parkingSpacesArray[0]._id})
					.then((parkingSpace) =>
					{
						expect(parkingSpace).toNotExist();
						done();
					})
					.catch((e) => done(e));
			});
	});

	it('should remove the parking space by id and return the deleted object', (done)=>
	{
		request(app)
			.delete('/parkingSpaces')
			.send({longitude: parkingSpacesArray[0].longitude, latitude: parkingSpacesArray[0].latitude})
			.expect(200)
			.expect((res) =>
			{
				expect(res.body._id).toBe(parkingSpacesArray[0]._id.toString());
			})
			.end((err, res) =>
			{
				if (err)
				{
					return done(err);
				}
				ParkingSpace.findOne({_id: parkingSpacesArray[0]._id})
					.then((parkingSpace) =>
					{
						expect(parkingSpace).toNotExist();
						done();
					})
					.catch((e) => done(e));
			});
	});

	//with non existing parking space
	it('should fail and return 404', (done)=>
	{
		let _id = new ObjectID();
		request(app)
			.delete('/parkingSpaces')
			.send({_id: _id})
			.expect(404)
			.end((err, res) =>
			{
				if (err)
				{
					return done(err);
				}
				ParkingSpace.findOne({_id: _id})
					.then((parkingSpace) =>
					{
						expect(parkingSpace).toNotExist();
						done();
					})
					.catch((e) => done(e));
			});
	});

	//with non existing parking space
	it('should fail and return 404', (done)=>
	{
		let longitude = 40;
		let latitude = 50;
		request(app)
			.delete('/parkingSpaces')
			.send({longitude: longitude, latitude: latitude})
			.expect(404)
			.end((err, res) =>
			{
				if (err)
				{
					return done(err);
				}
				ParkingSpace.findOne({longitude: longitude, latitude: latitude})
					.then((parkingSpace) =>
					{
						expect(parkingSpace).toNotExist();
						done();
					})
					.catch((e) => done(e));
			});
	});

	//with missing latitude
	it('should fail and return 400', (done)=>
	{
		let longitude = 40;
		request(app)
			.delete('/parkingSpaces')
			.send({longitude: longitude})
			.expect(400)
			.end((err, res) =>
			{
				if (err)
				{
					return done(err);
				}
				ParkingSpace.findOne({longitude: longitude})
					.then((parkingSpace) =>
					{
						expect(parkingSpace).toNotExist();
						done();
					})
					.catch((e) => done(e));
			});
	});
});

describe('POST /parkingSpaces/searches', () =>
{
	it('should return search id for valid coordinates', (done) =>
	{
		let requestBody = {
			latitude: parkingSpacesArray[1].latitude,
			longitude: parkingSpacesArray[1].longitude,
			distance: 300
		};
		request(app)
			.post('/parkingSpaces/searches')
			.send(requestBody)
			.expect(200)
			.expect((res) =>
			{
				let data = res.body.data;
				expect(res.body.searchID).toExist();
			})
			.end((err) =>
			{
				if (err)
				{
					return done(err)
				}
				else
				{
					return done();
				}
			});
	});

	it('should return 400 when distance is not sent', (done) =>
	{
		let requestBody = {
			latitude: parkingSpacesArray[4].latitude,
			longitude: parkingSpacesArray[4].longitude
		};
		request(app)
			.post('/parkingSpaces/searches')
			.send(requestBody)
			.expect(400)
			.end((err) =>
			{
				if (err)
				{
					return done(err);
				}
				else
				{
					return done();
				}
			});
	});

	it('should return 400 when latitude not sent', (done) =>
	{
		let requestBody = {
			longitude: parkingSpacesArray[4].longitude,
			distance: 1000
		};
		request(app)
			.post('/parkingSpaces/searches')
			.send(requestBody)
			.expect(400)
			.end((err) =>
			{
				if (err)
				{
					return done(err);
				}
				else
				{
					return done();
				}
			});
	});

	it('should return 400 when invalid coordinates are sent', (done) =>
	{
		let requestBody = {
			latitude: -500,
			longitude: parkingSpacesArray[1].longitude,
			distance: 1000
		};
		request(app)
			.post('/parkingSpaces/searches')
			.send(requestBody)
			.expect(400)
			.end((err) =>
			{
				if (err)
				{
					return done(err)
				}
				else
				{
					return done();
				}
			});
	});

	it('should return 400 when negative distance is sent', (done) =>
	{
		let requestBody = {
			latitude: parkingSpacesArray[1].latitude,
			longitude: parkingSpacesArray[1].longitude,
			distance: -1000
		};
		request(app)
			.post('/parkingSpaces/searches')
			.send(requestBody)
			.expect(400)
			.end((err) =>
			{
				if (err)
				{
					return done(err)
				}
				else
				{
					return done();
				}
			});
	});

	it('should return 400 when distance is sent as string', (done) =>
	{
		let requestBody = {
			latitude: parkingSpacesArray[1].latitude,
			longitude: parkingSpacesArray[1].longitude,
			distance: "1000"
		};
		request(app)
			.post('/parkingSpaces/searches')
			.send(requestBody)
			.expect(400)
			.end((err) =>
			{
				if (err)
				{
					return done(err)
				}
				else
				{
					return done();
				}
			});
	});
	//todo implement tests for string addresses
});


describe('GET /parkingSpaces/searches/{id}', () =>
{
	/**
	 *
	 * @param res - the HTTP response
	 * @param distance
	 * @param querySendTimestamp
	 */
	let verifyResultIdenticalToOriginalSearch = function (res, longitude, latitude, distance, querySendTimestamp)
	{
		console.log(res.body);
		let latitudeReceived = res.body.latitude;
		expect(latitudeReceived)
			.toExist()
			.toBe(latitude);

		let longitudeReceived = res.body.longitude;
		expect(longitudeReceived)
			.toExist()
			.toBe(longitude);

		let distanceRecived = res.body.distance;
		expect(distance)
			.toExist()
			.toBe(distance);

		let timestamp = res.body.timestamp;
		expect(timestamp)
			.toExist()
			//the timestamp currently used as indicator if the search is still relevant hence requires few seconds accuracy
			.toBeGreaterThanOrEqualTo(querySendTimestamp)
			.toBeLessThanOrEqualTo(Date.now());
	};

	it('it should return the first 3 burla parking spaces', (done) =>
	{
		let distance = 300;
		let index = 1;//usedParkingSpaceIndex
		let requestBody = {
			latitude: parkingSpacesArray[index].latitude,
			longitude: parkingSpacesArray[index].longitude,
			distance: distance
		};
		let querySendTimestamp = Date.now();
		request(app)
			.post('/parkingSpaces/searches')
			.send(requestBody)
			.expect(200)
			.expect((res) =>
			{
				let searchID = res.body.searchID;
				expect(searchID).toExist();
				request(app)
					.get(`/parkingSpaces/searches/${searchID}`)
					.expect(200)
					.expect((res) =>
					{
						verifyResultIdenticalToOriginalSearch(res,
							requestBody.longitude,
							requestBody.latitude,
							requestBody.distance, querySendTimestamp);

						let results = res.body.results;
						expect(results).toExist();
						expect(Array.isArray(results)).toBe(true);
						expect(results.length).toBe(3);
						expect(_.findIndex(results, (element) => parkingSpacesArray[0].compare(element))).toBeGreaterThanOrEqualTo(0);
						expect(_.findIndex(results, (element) => parkingSpacesArray[1].compare(element))).toBeGreaterThanOrEqualTo(0);
						expect(_.findIndex(results, (element) => parkingSpacesArray[2].compare(element))).toBeGreaterThanOrEqualTo(0);
						expect(_.findIndex(results, (element) => parkingSpacesArray[3].compare(element))).toBeLessThanOrEqualTo(-1);
						expect(_.findIndex(results, (element) => parkingSpacesArray[4].compare(element))).toBeLessThanOrEqualTo(-1);
					})
					.end((err) =>
					{
						if (err)
						{
							return done(err)
						}
						else
						{
							return done();
						}

					});
			})
			.end((err) =>
			{
				if (err)
				{
					return done(err)
				}
			});
	});

	it('should return the 3 Burla and ben saruk parking spaces', (done) =>
	{
		let distance = 1000;
		let index = 1;//usedParkingSpaceIndex
		let requestBody = {
			latitude: parkingSpacesArray[index].latitude,
			longitude: parkingSpacesArray[index].longitude,
			distance: distance
		};
		let querySendTimestamp = Date.now();
		request(app)
			.post('/parkingSpaces/searches')
			.send(requestBody)
			.expect(200)
			.expect((res) =>
			{
				let searchID = res.body.searchID;
				expect(searchID).toExist();
				request(app)
					.get(`/parkingSpaces/searches/${searchID}`)
					.expect(200)
					.expect((res) =>
					{
						verifyResultIdenticalToOriginalSearch(res,
							requestBody.longitude,
							requestBody.latitude,
							requestBody.distance,
							querySendTimestamp);


						let results = res.body.results;
						expect(results).toExist();
						expect(Array.isArray(results)).toBe(true);
						expect(results.length).toBe(4);
						expect(_.findIndex(results, (element) => parkingSpacesArray[0].compare(element))).toBeGreaterThanOrEqualTo(0);
						expect(_.findIndex(results, (element) => parkingSpacesArray[1].compare(element))).toBeGreaterThanOrEqualTo(0);
						expect(_.findIndex(results, (element) => parkingSpacesArray[2].compare(element))).toBeGreaterThanOrEqualTo(0);
						expect(_.findIndex(results, (element) => parkingSpacesArray[3].compare(element))).toBeGreaterThanOrEqualTo(0);
						expect(_.findIndex(results, (element) => parkingSpacesArray[4].compare(element))).toBeLessThan(0);
					})
					.end((err) =>
					{
						if (err)
						{
							return done(err)
						}
						else
						{
							return done();
						}

					});
			})
			.end((err) =>
			{
				if (err)
				{
					return done(err)
				}
			});
	});

	it('should return only the gefen parking', (done) =>
	{
		let requestBody = {
			latitude: parkingSpacesArray[4].latitude,
			longitude: parkingSpacesArray[4].longitude,
			distance: 10
		};
		let querySendTimestamp = Date.now();
		request(app)
			.post('/parkingSpaces/searches')
			.send(requestBody)
			.expect(200)
			.expect((res) =>
			{
				let searchID = res.body.searchID;
				expect(searchID).toExist();
				request(app)
					.get(`/parkingSpaces/searches/${searchID}`)
					.expect(200)
					.expect((res) =>
					{
						verifyResultIdenticalToOriginalSearch(res,
							requestBody.longitude,
							requestBody.latitude,
							requestBody.distance,
							querySendTimestamp);

						let results = res.body.results;
						expect(results).toExist();
						expect(Array.isArray(results)).toBe(true);
						expect(results.length).toBe(1);
						expect(_.findIndex(results, (element) => parkingSpacesArray[0].compare(element))).toBeLessThan(0);
						expect(_.findIndex(results, (element) => parkingSpacesArray[1].compare(element))).toBeLessThan(0);
						expect(_.findIndex(results, (element) => parkingSpacesArray[2].compare(element))).toBeLessThan(0);
						expect(_.findIndex(results, (element) => parkingSpacesArray[3].compare(element))).toBeLessThan(0);
						expect(_.findIndex(results, (element) => parkingSpacesArray[4].compare(element))).toBeGreaterThanOrEqualTo(0);
					})
					.end((err) =>
					{
						if (err)
						{
							return done(err)
						}
						else
						{
							return done();
						}

					});
			})
			.end((err) =>
			{
				if (err)
				{
					return done(err)
				}
			});
	});

	it('return 404 for non-existing search result', (done) =>
	{
		//since every generated id is unique, this one should not be used in the system
		let fakeSearchResultID = new ObjectID();
		request(app)
			.get(`/parkingSpaces/searchResults/${fakeSearchResultID}`)
			.send()
			.expect(404)
			.end((err) =>
			{
				if (err)
				{
					return done(err);
				}
				return done(err);
			});
	});

});




