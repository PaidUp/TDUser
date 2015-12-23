'use strict';

var express = require('express');
var controller = require('./contact.controller');
var authCoreService = require('TDCore').authCoreService;
var config = require('../../../config/environment');

var router = express.Router();

router.post('/create/userId/:userId', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.create);
router.post('/list/userId/:userId', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.list);
router.get('/load/userId/:userId/contactId/:contactId', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.load);
router.put('/update/userId/:userId/contactId/:contactId', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.update);
router.delete('/delete/userId/:userId/contactId/:contactId', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.delete);

module.exports = router;