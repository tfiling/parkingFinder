var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth');//todo - not recommended, find the recommended way for web tokens

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send();
  });
};

module.exports = {authenticate};
