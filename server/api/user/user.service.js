'use strict';

var mongoose = require('mongoose');
var User = require('./user.model.js');
var moment = require('moment');
var Blind = require('blind');
var isValidSSN = require('is-valid-ssn');
var config = require('../../config/environment/index');

function save(user, cb) {createFacebookUser
  delete user.addresses;
  delete user.contacts;
  user.save(function(err, data) {
    if(err) {
      return cb(err);
    }
    return cb(null, data);
  });
}

function create(user, cb) {
  User.create(user, function(err, data) {
      if(err) {
        return cb(err);
      }
      return cb(null, data);
    }
  );
}

function validateGenderSync(gender) {
  if(gender != 'male' && gender != 'female'){
    return false;
  }
  return true;
}

function validateBirthDateSync(birthDate) {
  var isFuture = moment(moment(birthDate)).isAfter(new Date());
  if(moment(birthDate).format() === 'Invalid date'  || isFuture){
    return false;
  }
  return true;
}

var regExp = /^[a-zA-Z\s]*$/;
function validateFirstNameSync(firstName) {
  if(!regExp.test(firstName) || firstName === '' || firstName === undefined || firstName === null || firstName.length > 128 ){
    return false;
  }
  return true;
}

function validateLastNameSync(lastName) {
  if(!regExp.test(lastName) || lastName === '' || lastName === undefined || lastName === null || lastName.length > 128 ){
    return false;
  }
  return true;
}

function findOne(filter, fields, cb) {
  User.findOne(filter, fields, function(err, data) {
      if(err) {
        return cb(err);
      }
      return cb(null, data);
    }
  );
}

function findById(id, cb) {
  User.findById(id, function (err, user) {
      if(err) {
        return cb(err);
      }
      return cb(null, user);
    }
  );
}

function createFacebookUser(fbUser, cb) {
  var newFbUser = {
    firstName: fbUser.first_name,
    lastName: fbUser.last_name,
    email: fbUser.email,
    facebook: {
      id: fbUser.id,
      email: fbUser.email
    },
    verify:{
      status:"verified",
      updatedAt: new Date()
    }
  };
  if(fbUser.isParent === false){
    newFbUser.roles = [];
    newFbUser.roles.push("coach");
  }
  this.create(newFbUser, function (err, data) {
    if(err) return cb(err);
      return cb(null, data);
  });
}
function mergeFacebookUser(dataUser ,cb) {
  dataUser.user.facebook = {
    id: dataUser.fbUser.id,
    email: dataUser.fbUser.email
  };
  this.save(dataUser.user, function (err, data) {
    if(err) return cb(err);
    return cb(null, data);
  });
}

function find(filter,fields, cb) {
  User.find(filter,fields, function(err, data) {
      if(err) {
        return cb(err);
      }
      return cb(null, data);
    }
  );
}

function update(filter, value, cb) {
  delete value.hashedPassword;
  delete value.addresses;
  delete value.contacts;
  User.update(filter, value, function(err, data) {
    if(err) {
      return cb(err);
    }
    return cb(null, data);
  });
}

function validateOnlyLetterSync(word) {
  if(!regExp.test(word) || word === '' || word === undefined || word === null){
    return false;
  }
  return true;
}

var encryptKey = config.encryptKey;
function encryptSSN(ssn){
  var encrypted = new Blind({ encryptKey: encryptKey }).encrypt(ssn);
  return encrypted;
}

function decryptSSN(encryptedSSN){
  var decrypted = new Blind({ encryptKey: encryptKey }).decrypt(encryptedSSN);
  return decrypted;
}

function verifySSN(ssn) {
  return isValidSSN(ssn);
}

function getlast4ssn(encryptedSSN){
  var last4snn = decryptSSN(encryptedSSN);
  return last4snn.substring(last4snn.length - 4, last4snn.length);
}

exports.save = save;
exports.validateGenderSync = validateGenderSync;
exports.validateBirthDateSync = validateBirthDateSync;
exports.validateFirstNameSync = validateFirstNameSync;
exports.validateLastNameSync = validateLastNameSync;
exports.findOne = findOne;
exports.findById = findById;
exports.createFacebookUser = createFacebookUser;
exports.mergeFacebookUser = mergeFacebookUser;
exports.find = find;
exports.create = create;
exports.update = update;
exports.validateOnlyLetterSync = validateOnlyLetterSync;
exports.encryptSSN = encryptSSN;
exports.decryptSSN = decryptSSN;
exports.verifySSN = verifySSN;
exports.getlast4ssn = getlast4ssn;
