'use strict';

var express = require('express');
var passport = require('passport');
var authService = require('../auth.service');
var userService = require('../../user/user.service');
var authCoreService = require('TDCore').authCoreService;
var logger = require('../../../config/logger');
var config = require('../../../config/environment');
var router = express.Router();

router.post('/signup', authCoreService.isAuthenticatedServer(config.TDTokens.me),function(req, res, next) {
  if(!authService.isValidEmail(req.body.email)){
    return res.status(400).json({
      "code": "ValidationError",
      "message": "Email is not valid"
    });
  }
  var validatePassword = authService.validationPasswordSync(req.body.password);
  if(validatePassword != ''){
    return res.status(400).json({
      "code": "ValidationError",
      "message": validatePassword
    });
  }
  var filter = {email: req.body.email};
  userService.findOne(filter, '', function(err, dataUserEmail){
    if(!dataUserEmail){
      userService.findById(req.body.userId, function (err, user) {
        if(!user){
          return res.status(404).json({
            "code": "AuthCredentialNotExists",
            "message": "User Id does not exist"
          });
        }
        if(user.createdBy != null || user.email != null || user.hashedPassword != null){
          return res.status(403).json({
            "code": "AuthCredentialPermission",
            "message": "You don't have permission for this operation"
          });
        }
        user.email = req.body.email;
        user.password = req.body.password;//here
        userService.save(user, function(err, response) {
          if (err) return res.status(500).json(err);
          authService.verifyEmailRequest(response, function(err, data) {
            if(err){
              logger.err('err', err);
              return res.status(500).json(err);
            }
            var token = authService.signToken(response._id,req.body.rememberMe);
            data.token = token;
            return res.status(200).json(data);
          });
        });
      });
    }else{
      return res.status(409).json({
        "code": "AuthCredentialExists",
        "message": "Email is already in use"
      });
    }
  });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.status(401).json(error);
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});
    var token = authService.signToken(user._id, req.body.rememberMe);
    res.status(200).json({token: token});
  })(req, res, next)
});

module.exports = router;
