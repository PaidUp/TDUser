'use strict';

var User = require('../user.model.js');
var Contact = require('./contact.model');

function validateTypeContactSync(contact) {
  if(contact != 'telephone' && contact != 'email'){
    return false;
  }
  return true;
}

function findOneFilter(filter,fields, cb) {
  User.findOne(filter,fields, function(err, data) {
      if(err) {
        return cb(err);
      }
      return cb(null, data);
    }
  );
}

function validateTelephoneSync(telephone) {
  if(typeof telephone != 'number'){
  return false;
  }
  return true;
}

exports.validateTypeContactSync = validateTypeContactSync;
exports.findOneFilter = findOneFilter;
exports.validateTelephoneSync = validateTelephoneSync;