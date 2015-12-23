'use strict';

var userService = require('../user/user.service');
var authService = require('./auth.service');
var logger = require('../../config/logger');

exports.verifyRequest = function(req, res, next) {
  var id = req.params.userId;
  userService.findOne({_id:id},'', function(err, user){
    if(err){
      return res.status(400).json({
        code: 'ValidationError',
        message: 'The given user id doesn\'t correspond to any user'
      });
    }
    authService.verifyEmailRequest(user, function(err, data) {
      if(err){
        logger.info(err, err);
      }
    });
    return res.status(200).json({});
  });
};

exports.verify = function(req, res, next) {
  if(!req.body.verifyToken){
    return res.status(400).json({
      "code": "ValidationError",
      "message": "verifyToken is missing"
    });
  };
  var verifyToken = req.body.verifyToken;
  authService.verifyEmail(verifyToken, function(err, data){
    if(err || !data) {
        logger.info(err, err);
        return res.status(400).json({
          code: "ValidationError",
          message: "Token is not valid"
        });
    }
    res.status(200).json({});
  });
};

exports.passwordResetRequest = function(req, res, next) {
  if(!req.body.email){
    return res.status(400).json({
      "code": "ValidationError",
      "message": "email is missing"
    });
  };
  var filter = {'email':req.body.email.toLowerCase()};
  userService.findOne(filter, '', function(err, data) {
    if (err) {
      logger.info(err, err);
      return res.status(400).json({});
    }
    if (!data) return res.status(400).json({
      "code": "ValidationError",
      "message": "invalid email."
    });
    if (data.facebook.id) return res.json(200, {
      "code": "ValidationError",
      "message": "email registered with facebook"
    });
    authService.ResetPassword(data, function(err, data) {
      if(err){
        logger.info(err, err);
      }
      res.status(200).json(data);
    });
  });
};

exports.passwordReset = function(req, res, next) {
  var tokenNewPwd = req.body;
  if(!req.body.verifyToken || !req.body.password){
    return res.status(400).json({
      "code": "ValidationError",
      "message": "Missing information."
    });
  }
  authService.verifyPasswordToken(tokenNewPwd, function(err, data){
    if(err) {
      logger.info(err, err);
      return res.status(400).json({
        code: "ValidationError",
        message: "Token is not valid"
      });
    }
    res.status(200).json({});
  });
};

exports.passwordUpdate = function(req, res, next) {
  var userId = {_id:req.params.userId};
  var validatePassword = authService.validationPasswordSync(req.body.newPassword);
  if(validatePassword != ''){
    return res.status(400).json({
      "code": "ValidationError",
      "message": validatePassword
    });
  }
  userService.findOne(userId,'' , function(err, dataUserPass){
    if (err) {
      logger.info(err, err);
      return res.status(500).json(err);
    }
    if(!dataUserPass){
      return res.status(404).json({
        "code": "AuthCredentialNotExists",
        "message": "User Id does not exist"
      });
    }
    if(!dataUserPass.authenticate(req.body.currentPassword)){
      return res.status(400).json({
        "code": "ValidationError",
        "message": "Current password is wrong",
      })
    }
    dataUserPass.hashedPassword = dataUserPass.encryptPassword(req.body.newPassword);
    userService.save(dataUserPass, function(err, data) {
      if (err) {
        logger.info(err, err);
        return res.status(500).json(err);
      }
      res.status(200).json({});
    });
  });
};

exports.emailUpdate = function(req, res, next) {
  var userId = req.params.userId;
  var userUpdate = req.body.userId;
  var isValidEmail = authService.isValidEmail(req.body.email);
  if(!isValidEmail){
    return res.status(400).json({
      "code": "ValidationError",
      "message": "email is not accepted"
    });
  }
  var filter = {_id:userId};
  if(userUpdate != userId) {
    filter = {createdBy : userId, _id:userUpdate};
  }
  userService.findOne(filter, '', function(err, dataUserEmail){
    if(!dataUserEmail){
      return res.status(403).json({
        "code": "ValidationError",
        "message": "You don't have permission for this operation"
      });
    }
    dataUserEmail.email = req.body.email;
    userService.save(dataUserEmail, function(err, data) {
      if (err) {
        logger.info(err, err);
        return res.status(500).json(err);
      }
      if(userUpdate == userId) {
        authService.verifyEmailRequest(data, function(err, data) {
          if(err){
            logger.info(err, err);
          }
        });
      }
      res.status(200).json({});
    });
  });
};

exports.logout = function(req, res, next) {
  var token = authService.getTokenFromRequest(req);
  if (token != null) {
    authService.revokeToken(token);
    delete req.user;
  }
  res.status(200).json({});
};

exports.getSessionSalt = function(req, res, next) {
  var token = req.body.token;
  authService.getSessionSalt(token , function(err, data){
    if(err) return res.status(500).json(err);
    res.status(200).json(data);
  });
};
