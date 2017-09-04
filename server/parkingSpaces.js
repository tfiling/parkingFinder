/**
 * Created by gal on 31-Aug-17.
 */

const _ = require('lodash');//utils
const bodyParser = require('body-parser');//parsing jsons in http request body
const {ObjectID} = require('mongodb');//data base
const {mongoose} = require('./db/mongoose');//ORM for mongodb
const {ParkingSpace} = require('./models/parkingSpace');
const isValidateCoordinates = require('is-valid-coordinates');


function addParkingSpaceHandlers(app)
{
	app.post('/parkingSpaces', async (req, res) =>
	{
		var parkingSpace = new ParkingSpace(req.body);
		parkingSpace.save().then(() =>
		{
			res.status(200).send(parkingSpace);
		})
			.catch((e) =>
			{
				console.log(`failed creating new available parking entry with the following ${e}`);
				res.status(400).send(e);
			});
	});

	app.delete('/parkingSpaces', async (req, res) => {
		var latitude = req.body.latitude;
		var longitude = req.body.longitude;
		var _id = req.body._id;
		console.log(req.body);

		if (!(longitude && latitude) &&
			!_id) {//should get either coordinates or instance id
			return res.status(400).send();
		}

		if (_id) {
			try
			{
				var parkingSpace = await ParkingSpace.findByID(_id);
				if (!parkingSpace)
				{
					return res.status(404).send();//tried to delete non existing parking space
				}

				await ParkingSpace.remove({_id: _id});
				return res.status(200).send(parkingSpace);
			}
			catch(e)
			{
				return res.status(500).send(e);
			}
		}
		if (longitude && latitude)
		{
			try
			{
				var parkingSpace = await ParkingSpace.findByCoordinates(longitude, latitude);
				if (!parkingSpace)
				{
					return res.status(404).send('not found');//tried to delete non existing parking space
				}

				await ParkingSpace.remove({longitude: longitude, latitude: latitude});
				return res.status(200).send(parkingSpace);
			}
			catch(e)
			{
				return res.status(500).send(e);
			}
		}
		res.status(500).send({"error": "reached end of scope without returning"});//todo
	});

	app.get('/parkingSpaces', (req, res) =>
	{
		let latitude = req.body.latitude;
		let longitude = req.body.longitude;
		let distance = req.body.distance;
		let addresString = req.body.address;
		let requestCoordinates = {longitude, latitude};
		console.log(requestCoordinates);

		if (!distance || !(typeof distance === 'number') || distance <= 0)
		{//required
			return res.status(400).send({error: 'distance is required'});
		}
		if (((!latitude && !longitude) || isValidateCoordinates(longitude, latitude)) &&
			(!addresString))
		{
			return res.status(400).send({error: 'address or coordinates are required'});
		}

		if (longitude && latitude && isValidateCoordinates(longitude, latitude))
		{
			ParkingSpace.find({}, function(err, parkingSpaces)
			{
				console.log(distance);
				if (err)
				{
					console.log(`GET /parkingSpaces database query error: ${err}`);
					return res.status(500).send({error: `internal error: ${err}`});
				}
				var filteredParkingSpaces = parkingSpaces.filter((parkingSpace) =>
				{
					console.log(parkingSpace.getDistance(requestCoordinates));
					console.log(parkingSpace.getDistance(requestCoordinates) <= distance);
					return parkingSpace.getDistance(requestCoordinates) <= distance;
				});
				console.log(filteredParkingSpaces);
				return res.status(200).send({data: filteredParkingSpaces});
			});
		}
		else if (addresString)
		{
			//todo implement
			return res.status(404).send({error: 'not implemented yet'});
		}

		console.log('end of get!!')

	});
}

module.exports = {addParkingSpaceHandlers};