/**
 * Created by gal on 31-Aug-17.
 */

//todo - remove unnecessary require
const mongoose = require('mongoose');
const validator = require('validator');//todo can it verify the coordinates?
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
	},
});

ParkingSpaceSchema.statics.findByCoordinates = function (lon, lat)
{
	//todo - implement
};

ParkingSpaceSchema.statics.findByID = function (lon, lat)
{
	//todo - implement
};


var ParkingSpace = mongoose.model('ParkingSpace', ParkingSpaceSchema);

module.exports = {ParkingSpace}




