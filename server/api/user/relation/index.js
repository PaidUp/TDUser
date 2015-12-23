'use strict';

var express = require('express');
var controller = require('./relation.controller');
var config = require('../../../config/environment');
var authCoreService = require('TDCore').authCoreService;

var router = express.Router();

router.post('/create', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.create);
router.get('/list/userId/:userId', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.list);

module.exports = router;