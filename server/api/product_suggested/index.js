'use strict';

var express = require('express');
var controller = require('./productSuggested.controller');
//var config = require('../../../config/environment');

var router = express.Router();

//router.post('/products/save', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.save);
router.post('/save',  controller.save);
router.post('/delete',  controller.findAndDelete);
router.get('/:email',  controller.findByEmail);

module.exports = router;