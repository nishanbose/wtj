'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config/environment');
var User = require('../api/user/user.model');

// Passport Configuration
require('./local/passport').setup(User, config);
require('./facebook/passport').setup(User, config);
<<<<<<< HEAD
require('./google/passport').setup(User, config);
require('./twitter/passport').setup(User, config);
=======
// require('./google/passport').setup(User, config);
// require('./twitter/passport').setup(User, config);
>>>>>>> upstream/master

var router = express.Router();

router.use('/local', require('./local'));
router.use('/facebook', require('./facebook'));
<<<<<<< HEAD
router.use('/twitter', require('./twitter'));
router.use('/google', require('./google'));

module.exports = router;
=======
// router.use('/twitter', require('./twitter'));
// router.use('/google', require('./google'));

module.exports = router;
>>>>>>> upstream/master
