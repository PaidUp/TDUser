'use strict';

var config = require('../../config/environment');
var User = require('./user.model');
var userService = require('./user.service');
var mongoose = require('mongoose');
var authService = require('../auth/auth.service');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

exports.create = function(req, res) {
  if(req.body.userId) {
    req.body.createdBy = req.body.userId;
    var isValidGender = userService.validateGenderSync(req.body.gender);
    if(!isValidGender){
      return res.status(400).json({
        "code": "ValidationError",
        "message": "Gender is not accepted"
      });
    }
  }

  if(req.body.isParent === false){
    req.body.roles = [];
    req.body.roles.push('coach');
  }
  var user = new User(req.body);
  if(!config.isLoanUser){
    var isValidBirthDate = userService.validateBirthDateSync(req.body.birthDate);
    if(!isValidBirthDate){
      return res.status(400).json({
        "code": "ValidationError",
        "message": "Birth date is not accepted"
      });
    };
  }else{
    if(!req.body.ssn || !userService.verifySSN(user.ssn)){
      return res.status(400).json({
        "code": "ValidationError",
        "message": "SSN is not valid"
      });
    }
    user.ssn = userService.encryptSSN(req.body.ssn);
  }

  var isValidFirstName = userService.validateFirstNameSync(req.body.firstName);
  if(!isValidFirstName){
   return res.status(400).json({
     "code": "ValidationError",
     "message": "First name is not accepted"
   });
  }
  var isValidLastName = userService.validateLastNameSync(req.body.lastName);
  if(!isValidLastName){
   return res.status(400).json({
     "code": "ValidationError",
     "message": "Last name is not accepted"
   });
  }
  userService.save(user, function(err, data) {

    if(err) return validationError(res, err);
    return res.status(200).json({userId : data._id});
  });
};

exports.createAll = function(req, res){
  var body = req.body;
  if(!body){
    return res.status(422).json({message: 'request can`t be empty'});
  }
  if(!body.firstName){
    return res.status(422).json({message: 'firstName is require'});
  }
  if(!body.lastName){
    return res.status(422).json({message: 'lastName is require'});
  }
  if(!body.email){
    return res.status(422).json({message: 'email is require'});
  }
  if(!body.password){
    return res.status(422).json({message: 'password is require'});
  }
  if(!body.address){
    return res.status(422).json({message: 'address is require'});
  }
  if(!body.city){
    return res.status(422).json({message: 'city is require'});
  }
  if(!body.state){
    return res.status(422).json({message: 'state is require'});
  }
  if(!body.country){
    return res.status(422).json({message: 'country is require'});
  }
  if(!body.zipCode){
    return res.status(422).json({message: 'zipCode is require'});
  }
  if(!body.phone){
    return res.status(422).json({message: 'phone is require'});
  }
  if(!body.getFrom){
    return res.status(422).json({message: 'getFrom is require'});
  }

  

  userService.createAll(body, function(err, data){
    if(err){
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  })

}

exports.me = function(req, res, next) {
  authService.decryptToken(req.query.token, function(err, id){
    if(err){
      return res.status(401).json({
        code: "AuthFailed",
        message: "Authentication token is invalid"
      });
    }
    userService.findOne({
      _id: id
    }, '-salt -hashedPassword -verify.token -verify.updatedAt -role -updateAt -createAt -resetPassword', function(err, user) { // don't ever give out the password or salt
      if (err) return next(err);
      if (!user) return res.status(401).json({
        code: "AuthFailed",
        message: "Couldn't find a user with the given token"
      });
      res.status(200).json(user);
    });

  });
};

exports.update = function(req, res, next) {
  var userId = req.params.userId;
  var userUpdate = req.body.userId;
  var isValidFirstName = userService.validateFirstNameSync(req.body.firstName);
  if(!isValidFirstName){
    return res.status(400).json({
      "code": "ValidationError",
      "message": "First name is not accepted"
    });
  }

  var isValidLastName = userService.validateLastNameSync(req.body.lastName);
  if(!isValidLastName){
    return res.status(400).json({
      "code": "ValidationError",
      "message": "Last name is not accepted"
    });
  }
  var filter = { _id: userId };
  if(userUpdate != userId) {//Here - validate if user is parent or athlete.
    var isValidGender = userService.validateGenderSync(req.body.gender);
    if(!isValidGender){
      return res.status(400).json({
        "code": "ValidationError",
        "message": "Gender is not accepted"
      });
    }
    var isValidBirthDate = userService.validateBirthDateSync(req.body.birthDate);
    if(!isValidBirthDate){
      return res.status(400).json({
        "code": "ValidationError",
        "message": "Birthdate is not accepted"
      });
    }
    filter = {_id:userUpdate};

  }
  userService.findOne(filter, '', function(err, userFind) {
    if(err) return res.status(409).json(res, err);
    if(!userFind){
      return res.status(404).json({
        "code": "AuthCredentialNotExists",
        "message": "User Id does not exist"
      });
    }
    userFind.firstName = req.body.firstName;
    userFind.lastName = req.body.lastName;
    if(userUpdate != userId){//move to user.service
      userFind.gender = req.body.gender;
      userFind.birthDate = req.body.birthDate;
    }
    userService.save(userFind, function(err, userSave) {
      if(err) return validationError(res, err);
      res.status(200).json({});
    });
  });
};

exports.find = function(req, res, next) {
  var filter = req.body;
  userService.find(filter, '', function(err, users) {
    if(err) {
      return res.status(400).json({
        "code": "ValidationError",
        "message": "filter incorrect."
      });
    }
    if (!users) return res.status(403).json({
      "code": "User permission error",
      "message": "You don't have permission for this operation"
    });
    if(config.isLoanUser && (users.length=1)){
      users[0].ssn = userService.getlast4ssn(users[0].ssn);
    }
    res.status(200).json(users);
  });
};

exports.save = function(req, res, next){
  var filter = {_id:req.body._id};
  userService.update(filter, req.body, function(err, userUpd){
    if(err) {
      return res.status(400).json({
        "code": "ValidationError",
        "message": "filter incorrect update."
      });
    }
    if (!userUpd){
      return res.status(403).json({
        "code": "User permission error",
        "message": "You don't have permission for this operation"
      });
    }
    userService.findOne(filter, '', function(err, user) {
      if(err) {
        return res.status(400).json({
          "code": "ValidationError",
          "message": "filter incorrect find."
        });
      }
      if (!user){
        return res.status(403).json({
          "code": "User permission error",
          "message": "You don't have permission for this operation"
        });
      }
      res.status(200).json(user);
    });
  });
}

exports.validateSign = function(req, res, next){
  if(!req.body.userId || !req.body.firstName || !req.body.lastName || !req.body.ssn){
    return res.status(400).json({
      "code": "ValidationError",
      "message": "sign is incorrect"
    });
  }
  userService.findById(req.body.userId, function(err, user){
    if(err){
      return res.status(400).json({
        "code": "ValidationError",
        "message": "user is incorrect"
      });
    }
    var ssnDecypt = userService.getlast4ssn(user.ssn);
    if(user.firstName === req.body.firstName && user.lastName === req.body.lastName && ssnDecypt === req.body.ssn){
      return res.status(200).json({isCorrect:true});
    }else{
      return res.status(200).json({isCorrect:false});
    }
  });
}
/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
