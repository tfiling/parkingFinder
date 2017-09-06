/**
 * Created by gal on 04-Sep-17.
 */

//todo - remove unnecessary require
const mongoose = require('mongoose');
const validator = require('validator');//todo can it verify the coordinates?
const _ = require('lodash');
const haversine = require('haversine-geolocation');//calculate the distance between two coordinates
const {ParkingSpace, ParkingSpaceSchema} = require('./parkingSpace');

var SearchResultsSchema = new mongoose.Schema({
	//todo verify and complete
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
	distance: {
		type: Number,
		required: true,
		trim: true
	},
	timestamp:{
		type: Number,
		required: true,
		trim: true
	},
	results: {
		type: [ParkingSpaceSchema],
		default: []
	}
});


//since vacant parking is very volatile equality requires the two searches to be conducted
// in a range of no longer than 10 seconds
SearchResultsSchema.statics.equalityTimestampDiff = 10000;//linux time stamp is in milliseconds


SearchResultsSchema.methods.compare = function (secondObj)
{//todo test
	let requiredProperties = ['latitude', 'longitude', 'distance'];
	let firstObj = this.toObject();
	for(i = 0; i < requiredProperties.length; i++)
	{
		var element = requiredProperties[i];
		if (!firstObj.hasOwnProperty(element) ||
			!secondObj.hasOwnProperty(element) ||
			!(firstObj[element] === secondObj[element]))
		{
			return false;
		}
	}
	if (!firstObj.hasOwnProperty('timestamp') ||
		!secondObj.hasOwnProperty('timestamp') ||
		Math.abs(firstObj['timestamp'] - secondObj['timestamp']) > SearchResultsSchema.statics.equalityTimestampDiff)
	{
		return false;
	}
	return true;
};

//the folowing is muted for now. currently not needed - will use mongodb's _id
//the uri for a specific search result includes this ID
//the ID must bu unique
// SearchResultsSchema.statics.createSearchID = function () {
// 	return new ObjectID();
// };

SearchResultsSchema.methods.sortResults = function ()
{
	//future todo implement
};

SearchResultsSchema.methods.getClosestParkingSpace = function ()
{
	//future todo implement
};

/**
 *
 * @param id
 *
 * @return promise with the query result
 */
SearchResultsSchema.statics.findByID = function (id)
{
	return SearchResult.findOne({_id: id});
};


var SearchResult = mongoose.model('SearchResult', SearchResultsSchema);

module.exports = {SearchResult};
