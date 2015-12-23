'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../../config/environment');
var User = require('../user/user.model');
var authCoreService = require('TDCore').authCoreService;
var authController = require('./auth.controller');

// Passport Configuration
require('./local/passport').setup(User, config);
var router = express.Router();

router.use('/local', require('./local'));
router.use('/facebook', require('./facebook/index'));

router.get('/verify-request/userId/:userId' , authCoreService.isAuthenticatedServer(config.TDTokens.me), authController.verifyRequest);
router.post('/verify', authCoreService.isAuthenticatedServer(config.TDTokens.me), authController.verify);
router.post('/session/salt', authCoreService.isAuthenticatedServer(config.TDTokens.me), authController.getSessionSalt);

router.post('/password/reset-request', authCoreService.isAuthenticatedServer(config.TDTokens.me), authController.passwordResetRequest);
router.post('/password/reset', authCoreService.isAuthenticatedServer(config.TDTokens.me), authController.passwordReset);
router.post('/password/update/userId/:userId', authCoreService.isAuthenticatedServer(config.TDTokens.me), authController.passwordUpdate);

router.post('/email/update/userId/:userId', authCoreService.isAuthenticatedServer(config.TDTokens.me), authController.emailUpdate);
router.get('/logout/userId/:userId', authCoreService.isAuthenticatedServer(config.TDTokens.me), authController.logout);

module.exports = router;
