'use strict';

var express = require('express');
var controller = require('./permissions.controller');
var authCoreService = require('TDCore').authCoreService
var config = require('../../config/environment');

var router = express.Router();

router.get('/', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.findByRole);

module.exports = router;