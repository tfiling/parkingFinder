/**
 * Created by gal on 03-Sep-17.
 */
const expect = require('expect');
const request = require('supertest');
const _ = require('lodash');
const {ObjectID} = require('mongodb');
const {ParkingSpace} = require('./../../models/parkingSpace');

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


describe('ParkingSpaceSchema.statics.compare', () =>
{
		it('should return true for equivalent but different instances', (done) =>
			{
				var otherObj = new ParkingSpace({latitude: parkingSpacesArray[0].latitude,
					longitude: parkingSpacesArray[0].longitude});
				expect(otherObj.compare(parkingSpacesArray[0])).toBe(true);
				expect(parkingSpacesArray[0].compare(otherObj)).toBe(true);
				done();
			});

		it('should return true for identical objects', (done) =>
		{
			expect(parkingSpacesArray[0].compare(parkingSpacesArray[0])).toBe(true);
			done();
		});

		it('should return false for invalid other object', (done) =>
		{
			expect(parkingSpacesArray[0].compare({})).toBe(false);
			expect(parkingSpacesArray[0].compare({latitude: 10, longitude: -10})).toBe(false);
			expect(parkingSpacesArray[0].compare({latitude: -10, longitude: -10})).toBe(false);
			expect(parkingSpacesArray[0].compare({latitude: -10, longitude: 10})).toBe(false);
			expect(parkingSpacesArray[0].compare({latitude: -10})).toBe(false);
			expect(parkingSpacesArray[0].compare({longitude: -10})).toBe(false);
			expect(parkingSpacesArray[0].compare({latitude: 10, longitude: "15"})).toBe(false);
			expect(parkingSpacesArray[0].compare({latitude: 10, longitude: 10000})).toBe(false);
			done();
		});
});
