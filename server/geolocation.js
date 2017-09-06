/**
 * Created by gal on 06-Sep-17.
 */
const request = require('request');
/**
 *
 * @param address
 * @param callback: (errorMessage, code, [{longitude, latitude, stringAddress}]) -> void
 */
var geocodeAddress = (address, callback) => {
	var encodedAddress = encodeURIComponent(address);

	request({
		url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`,
		json: true
	}, (error, response, body) => {
		if (error) {
			callback('Unable to connect to Google servers.', 500, []);
		} else if (body.status === 'ZERO_RESULTS') {
			callback('Unable to find that address.', 404, []);
		} else if (body.status === 'OK') {
			var parsedResults = body.results
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
			callback(undefined, 200, parsedResults);
		}
	});
};

module.exports.geocodeAddress = geocodeAddress;
