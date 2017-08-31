require('./config/config');

const _ = require('lodash');//utils
const express = require('express');//http request handling
const bodyParser = require('body-parser');//parsing jsons in http request body
const {ObjectID} = require('mongodb');//data base

var {mongoose} = require('./db/mongoose');//ORM for mongodb
var {User} = require('./models/user');//user model
var {authenticate} = require('./middleware/authenticate');//authentication middleware

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// signup
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
});

//get user's profile
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

//login - authenticate
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

//logout
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};
