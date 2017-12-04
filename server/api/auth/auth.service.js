'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../user/user.model');
var validateJwt = expressJwt({ secret: config.secrets.session });
var uuid = require('node-uuid');
var authEmailService = require('./auth.email.service');
var userService = require('../user/user.service');
var TOKEN_EXPIRATION = 60;
var TOKEN_EXPIRATION_MIN = TOKEN_EXPIRATION * 1;
var TOKEN_EXPIRATION_MAX = TOKEN_EXPIRATION * 60 * 24 * 365;

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
 function isAuthenticated() {
   return compose()
     // Validate token jwt and redis
     .use(function(req, res, next) {
       var token = getTokenFromRequest(req);
       req.headers.authorization = 'Bearer ' + token;
       validateToken(req, res, next);
     })
     // Attach user to request
     .use(function(req, res, next) {
       User.findById(req.user._id, function (err, user) {
         if (err) return next(err);
         if (!user) return res.send(401);
         req.user = user;
         next();
       });
     });
 }

 function getAuthenticatedUserSync(req,res) {
       try{
         var token = getTokenFromRequest(req);
         req.headers.authorization = 'Bearer ' + token;
         validateToken(req, res);
         User.findById(req.user._id, function (err, user) {
           if (err) return null;
           if (!user) return null;
           return user;
         });
       }catch(err){
         return null
       }
 }

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.send(403);
      }
    });
}

function isValidEmail(mail)
{
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(mail);
}

/**
 *
 * Token Functions
 *
 *
 */
function revokeToken(token) {
  return true;
  // TODO
};

function validateToken(req, res, next) {
  validateJwt(req, res, next);
  // TODO
  // validate token from database
  if(false) {
    // return error
  }
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id, rembemberMe) {
  console.log("@@PArams: ", `${id} rem: ${rembemberMe}`)
  var expireTime = TOKEN_EXPIRATION_MIN * 60;
  if(rembemberMe){
      expireTime = TOKEN_EXPIRATION_MAX * 60;
  }
  var token = jwt.sign({ _id: id , salt : uuid.v4()}, config.secrets.session, { expiresIn: expireTime });
  return token;
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {

  if (!req.user) return res.status(404).json({ message: 'Something went wrong, please try again.'});
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

/**
 * Get the token from HTTP Request
 * @param req
 * @returns {*}
 */
function getTokenFromRequest(req) {
  var token = null;
  // allow access_token to be passed through query parameter as well
  if(req.query && req.query.hasOwnProperty('token')) {
    token = req.query.token;
  }
  else if(req.body && req.body.token){
    token = req.body.token;
  }
  else if(req.query && req.query.hasOwnProperty('access_token')) {
    token = req.query.token;
  }else if(req.headers.authorization){
    token = req.headers.authorization.slice(7,req.headers.authorization.length);
  }
  return token;
}

function generateToken() {
  return uuid.v4();
}

function verifyEmailRequest(user, cb) {
  var token = this.generateToken();
  user.verify.updatedAt = new Date();
  user.verify.status = "sent";
  user.verify.email = user.email;
  user.verify.token = token;
  authEmailService.sendWelcomeTokenEmail(user, token, function(err, data){
    userService.save(user, function(err, result) {
      return cb(err, data);
    });
  });
}


function verifyEmail(token, cb) {
  var filter = {"verify.token" : token};
  userService.findOne(filter, '', function(err, data) {
    if (err) return cb(err);
    if(!data){
      return cb(err, data);
    }
    if(data && data.verify) {
      data.verify = {
        status : "verified",
        updatedAt : new Date()
      }
      userService.save(data, function (err, data) {
        return cb(err, data);
      });
    }
  });
}


function ResetPassword(user, cb) {
  var token = this.generateToken();
  user.resetPassword.updatedAt = new Date();
  user.resetPassword.status = "sent";
  user.resetPassword.token = token;
  authEmailService.sendResetTokenEmail(user, token, function(err, data){
    if(err) return cb(err);
    userService.save(user, function(err, response) {
      return cb(err, data);
    });
  });
}

function verifyPasswordToken(tokenPwd, cb) {
  var filter = {"resetPassword.token" : tokenPwd.verifyToken};
  userService.findOne(filter, '', function(err, data) {
    if (err) return cb(err);
    if(data && data.resetPassword) {
      data.resetPassword = {
        status : "verified",
        updatedAt : new Date()
      }
      data.hashedPassword = data.encryptPassword(tokenPwd.password);
      userService.save(data, function (err, data) {
        return cb(err, data);
      });
    }else{
      cb('Token is not valid');
    }
  });
}

function validationPasswordSync(password) {
  var messageValidation = '';
  var validations = [
    /*{
      pattern: /[a-z]+/,
      msg: 'No lowerCase'
    },
    {
      pattern: /[A-Z]+/,
      msg: 'No upperCase'
    },
    {
      pattern: /\W+/,
      msg: 'No specialCharacter'
    }*/
  ];
  if (!password) messageValidation += 'Password can\'t be blank';
  if(password && password.length < 6) {
    messageValidation += 'less than 8 characters';
  }

  for(var i= 0;i<validations.length;i++){
    if (!validations[i].pattern.test(password)) {
        messageValidation += ' ' + validations[i].msg;
    }
  };
  return messageValidation;
}

function decryptToken(token, cb){
  jwt.verify(token, config.secrets.session, function(err, data){
    if(err){
      return cb(err);
    }
    return cb(null,data._id);
  });
}

function newIsAuthenticated(token, cb){
  decryptToken(token, function(err, id){
    if(err){
      return cb(err);
    }
    userService.findOne({_id:id},'', function(err, user){
      if(err){
        return cb(err);
      }
      return res.status(null).json(user);
    });
  });
}

function getSessionSalt(token , cb){
  jwt.verify(token, config.secrets.session, function(err, data){
    if(err){
      return cb(err);
    }
    return cb(null,data.salt);
  });
}

exports.newIsAuthenticated = newIsAuthenticated;
exports.getAuthenticatedUserSync = getAuthenticatedUserSync;
exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.generateToken = generateToken;
exports.isValidEmail = isValidEmail;
exports.verifyEmailRequest = verifyEmailRequest;
exports.verifyEmail = verifyEmail;
exports.ResetPassword = ResetPassword;
exports.verifyPasswordToken = verifyPasswordToken;
exports.validationPasswordSync = validationPasswordSync;
exports.getTokenFromRequest = getTokenFromRequest;
exports.revokeToken = revokeToken;
exports.decryptToken = decryptToken;
exports.getSessionSalt = getSessionSalt;
