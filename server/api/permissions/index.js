'use strict';

var express = require('express');
var controller = require('./permissions.controller');
var authCoreService = require('TDCore').authCoreService
var config = require('../../config/environment');

var router = express.Router();

//router.post('/products/save', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.save);
//router.post('/save', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.save);
//router.post('/delete', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.findAndDelete);
//router.get('/', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.findByRole);
router.get('/',  controller.findByRole);

module.exports = router;