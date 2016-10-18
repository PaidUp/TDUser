'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var authCoreService = require('TDCore').authCoreService;

var router = express.Router();
router.post('/create', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.create);
router.post('/create/all', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.createAll);
router.get('/current', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.me);
router.post('/update/userId/:userId', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.update);
router.post('/:userId/update/products', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.updateProductsSuggested);
router.post('/find', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.find);

router.post('/save', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.save);
router.post('/sign', authCoreService.isAuthenticatedServer(config.TDTokens.me), controller.validateSign);

router.use('/contact', require('./contact/index'));
router.use('/address', require('./address/index'));
router.use('/relation', require('./relation/index'));

module.exports = router;