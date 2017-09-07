/**
 * Created by gal on 04-Sep-17.
 */

//todo - remove unnecessary require
const mongoose = require('mongoose');
const validator = require('validator');//todo can it verify the coordinates?
const _ = require('lodash');
const haversine = require('haversine-geolocation');//calculate the distance between two coordinates
const {ParkingSpace, ParkingSpaceSchema} = require('./parkingSpace');
const requestPN = require('request-promise-native');

var SearchResultsSchema = new mongoose.Schema({
	//todo verify and complete
	address: {
		type: String,
		trim: true,
		required: false
	},
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

/**
 * @throws error when request fails or
 * @param stringAddress
 * @return [{address, longitude, latitude}].length >= 1
 */
SearchResultsSchema.statics.parseStringAddress = async function(stringAddress)
{
	try
	{
		var encodedAddress = encodeURIComponent(stringAddress);

		var response = await requestPN({
			url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`,
			json: true
		});
	}
	catch (e)
	{
		let message = `SearchResult.parseStringAddress: google maps resulted the following error: ${e}`;
		console.log(message);
		var error = new Error(message);
		error.code = 500;
		throw error;
	}

	if (response.status === 'ZERO_RESULTS') {
		let message = `SearchResult.parseStringAddress: Unable to find address ${stringAddress}.`;
		console.log(message);
		var error = new Error(message);
		error.code = 400;
		throw error;
	} else if (response.status === 'OK') {
		var parsedResults = response.results
			.map((element) =>
			{//extract the desired properties for each result
				if (element.formatted_address &&
					element.geometry.location.lat &&
					element.geometry.location.lng)
				{
					return {
						address: element.formatted_address,
						latitude: element.geometry.location.lat,
						longitude: element.geometry.location.lng
					};
				}
				return undefined;
			})
			.filter((element) =>
			{//filter the result object that did not contain the desired properties
				return (element != undefined);
			});
		if (parsedResults.length == 0)
		{
			console.log(`SearchResult.parseStringAddress: failed extracting the coordinates from the ${response.results}`);
			var error = new Error('could not find the location of the address');
			error.code = 500;
			throw error;
		}
		return parsedResults;
	}
};


var SearchResult = mongoose.model('SearchResult', SearchResultsSchema);

module.exports = {SearchResult};
