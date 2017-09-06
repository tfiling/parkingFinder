/**
 * Created by gal on 31-Aug-17.
 */

//todo - remove unnecessary require
const mongoose = require('mongoose');
const validator = require('validator');//todo can it verify the coordinates?
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const haversine = require('haversine-geolocation');//calculate the distance between two coordinates
const isValidateCoordinates = require('is-valid-coordinates');

var ParkingSpaceSchema = new mongoose.Schema({
	longitude: {
		type: Number,
		required: true,
		trim: true
	},
	latitude: {
		type: Number,
		required: true,
		trim: true
	}
});

ParkingSpaceSchema.methods.toJSON = function () {
	var parkingSpace = this;
	var parkingSpaceObject = parkingSpace.toObject();

	return _.pick(parkingSpace, ['_id', 'latitude', 'longitude']);
};

ParkingSpaceSchema.methods.getDistance = function (otherObj)
{//todo test
	thisObjCoordinates = _.pick(this, ['latitude', 'longitude']);
	otherObjCoordinates = _.pick(otherObj, ['latitude', 'longitude']);
	try
	{
		return haversine.getDistanceBetween(thisObjCoordinates, otherObjCoordinates, 'm');
	}
	catch(e)
	{
		console.log(`ERROR ParkingSpaceSchema.methods.getDistance failed to calculate distance between ${thisObjCoordinates} and ${otherObjCoordinates} with error ${e}`);
	}
};

ParkingSpaceSchema.methods.compare = function (secondObj)
{//todo test
	let firstObj = this.toObject();
	let requiredProperties = ['latitude', 'longitude'];
	if (!ParkingSpace.isValid(firstObj) || !ParkingSpace.isValid(secondObj)) {
		return false;
	}
	for(i = 0; i < requiredProperties.length; i++)
	{
		var element = requiredProperties[i];
		if (!(firstObj[element] === secondObj[element]))
		{
			return false;
		}
	}
	return true;
};

ParkingSpaceSchema.statics.isValid = function(obj)
{
	let requiredProperties = ['latitude', 'longitude'];
	for(i = 0; i < requiredProperties.length; i++)
	{
		var element = requiredProperties[i];
		if (!obj.hasOwnProperty(element))
		{
			return false;
		}
	}
	return isValidateCoordinates(obj.longitude, obj.latitude);
};


/**
 *
 * @param lon
 * @param lat
 *
 * @return promise with the query result
 */
ParkingSpaceSchema.statics.findByCoordinates = function (lon, lat)
{
	return ParkingSpace.findOne({latitude: lat, longitude: lon});
};


/**
 *
 * @param id
 *
 * @return promise with the query result
 */
ParkingSpaceSchema.statics.findByID = function (id)
{
	return ParkingSpace.findOne({_id: id});
};


var ParkingSpace = mongoose.model('ParkingSpace', ParkingSpaceSchema);

module.exports = {ParkingSpace, ParkingSpaceSchema};




