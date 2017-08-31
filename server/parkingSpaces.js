/**
 * Created by gal on 31-Aug-17.
 */

const _ = require('lodash');//utils
const bodyParser = require('body-parser');//parsing jsons in http request body
const {ObjectID} = require('mongodb');//data base

var {mongoose} = require('./db/mongoose');//ORM for mongodb
var {ParkingSpace} = require('./models/parkingSpace');

function addParkingSpaceHandlers(app)
{
	app.post('/parkingSpaces', async (req, res) =>
	{
		var parkingSpace = new ParkingSpace(req.body);
		parkingSpace.save().then(() =>
		{
			console.log(JSON.stringify(parkingSpace));
			res.status(200).send(parkingSpace);
		})
			.catch((e) =>
			{
				console.log(`failed creating new available parking entry with the following ${e}`);
				res.status(400).send(e);
			});
	});

	app.delete('/parkingSpaces', async (req, res) =>
	{//todo implement
		console.log(`delete! ${JSON.stringify(req.body)}`);
		res.status(404).send();
	});
}

module.exports = {addParkingSpaceHandlers};