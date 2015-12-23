'use strict';

var express = require('express');
var logger = require('../../../config/logger');
var authService = require('../auth.service');
var FB = require('fb');
var userService = require('../../user/user.service');

var router = express.Router();

router.post('/', function(req, res, next) {
  if(!req.body.facebookToken) {
    return res.status(400).json({
      "code": "ValidationError",
      "message": "FacebookToken missing parameter."
    });
  }
    FB.setAccessToken(req.body.facebookToken);
    FB.api('/me', function (fbUser) {
      if (fbUser && fbUser.error) {
        if (fbUser.error.code === 'ETIMEDOUT') {
          logger.log(fbUser.error, 'Facebook error: ETIMEDOUT');
        }
        else {
          logger.log(fbUser.error, fbUser.error);
        }
        return res.status(500).json({
          code: "UnexpectedError",
          message: "Facebook error",
          errors: fbUser.error
        });
      }
      else {
        if (!fbUser.email) return res.status(400).json({
          "code": "ValidationError",
          "message": "Facebook email is required"
        });
        var filter = {$or: [{"facebook.id": fbUser.id}, {"email": fbUser.email}]};
        userService.findOne(filter, '', function (err, user) {
          if (err) return res.status(500).json(err);
          if (!user) {
            // create
            fbUser.isParent = req.body.isParent;
            userService.createFacebookUser(fbUser, function(err, data) {
              if (err) return res.status(500).json(err);
              //err
              var token = authService.signToken(data._id);
              return res.status(200).json({token : token});
            });
          } else {
            if (!user.facebook.email) {
              // login with merge
              userService.mergeFacebookUser({user:user,fbUser:fbUser}, function(err, data) {
                if (err) return res.status(500).json(err);
                var token = authService.signToken(data._id);
                return res.status(200).json({token: token});
              });
            } else {
              // login
              var token = authService.signToken(user._id);
              return res.status(200).json({token: token});
            }
          }
        });
      }
    }, { fields: 'email,first_name,gender,last_name,link,locale,middle_name,name,timezone,updated_time,verified'});
});

module.exports = router;
