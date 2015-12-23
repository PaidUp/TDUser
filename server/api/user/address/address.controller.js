'use strict';

var addressService = require('./address.service');
var userService = require('../user.service');
var mongoose = require('mongoose');


exports.create = function(req, res, next) {
  var userId = req.params.userId;
  var addressId = mongoose.Types.ObjectId();
  var isValidTypeAddress = addressService.validateTypeAddressSync(req.body.type);
  if(!isValidTypeAddress){
    return res.status(400).json({
      "code": "ValidationError",
      "message": "Type address is not accepted"
    });
  }
  var isValidCity = userService.validateOnlyLetterSync(req.body.city);
  var isValidState = userService.validateOnlyLetterSync(req.body.state);
  if(!isValidCity || !isValidState){
    return res.status(400).json({
      "code": "ValidationError",
      "message": "State or City is not accepted"
    });
  }
  userService.findOne({_id:userId}, '', function(err, userFind) {
    if(err) return res.status(400).json({
      code: 'ValidationError',
      message: 'The given user id is invalid'
    });
    if(!userFind){
      return res.status(404).json({
        "code": "AuthCredentialNotExists",
        "message": "User Id does not exist"
      });
    }
    var addresses = {
      addressId : addressId,
      type: req.body.type,
      label : req.body.label,
      address1 : req.body.address1,
      address2 : req.body.address2,
      city : req.body.city,
      state : req.body.state,
      country : req.body.country,
      zipCode : req.body.zipCode
    };
    userFind.addresses.push(addresses);
    userService.save(userFind, function(err, userSave) {
      if(err) {
        return res.status(404).json({
          "code": "AuthCredentialNotExists",
          "message": "Address does not exist"
        });
      }
      res.status(200).json({addressId:addressId});
    });
  });
};

exports.list = function(req, res, next) {
  var userId = req.params.userId;
  userService.findOne({_id:userId},'-addresses.address1 -addresses.address2 -addresses.label -addresses.value -addresses.address -addresses.city -addresses.state -addresses.country -addresses.zipCode', function(err, userFind) {
    if(err) return res.status(400).json({
      code: 'ValidationError',
      message: 'The given user id is invalid'
    });
    if(!userFind){
      return res.status(404).json({
        code: 'AuthCredentialNotExists',
        message: 'User Id does not exist'
      });
    }
    res.status(200).json(userFind.addresses);
  });
};

exports.load = function(req, res, next) {
  if(!req.params && !req.params.addressId) {
    return res.status(400).json({
      "code": "ValidationError",
      "message": "Address Id is required"
    });
  }
  var addressId;
  var userId;
  try {
    userId = mongoose.Types.ObjectId(req.params.userId);
    addressId = mongoose.Types.ObjectId(req.params.addressId);
  }
  catch (err) {
    return res.status(400).json({
      code: "ValidationError",
      message: "The given address/userId id is not valid"
    });
  }
  var filter = {_id:userId,'addresses.addressId':addressId};
  userService.findOne(filter,{addresses: {$elemMatch: {'addressId': addressId}}}, function(err, userFind) {
      if(err) return res.status(400).json({
        code: "ValidationError",
        message: "The given address id is not valid"
      });
      if(!userFind){
        return res.status(404).json({
          "code": "AuthCredentialNotExists",
          "message": "Address does not exist"
        });
      }
      return res.status(200).json(userFind.addresses[0]);
    }
  );
};

exports.update = function(req, res, next) {
  if(!req.params && !req.params.addressId) {
    return res.status(400).json({
      "code": "ValidationError",
      "message": "Address Id is required"
    });
  }
  var userId;
  var addressId;
  try {
    userId = mongoose.Types.ObjectId(req.params.userId);
    addressId = mongoose.Types.ObjectId(req.params.addressId);
  }
  catch (err) {
    return res.status(400).json({
      code: "ValidationError",
      message: "The given address id is not valid"
    });
  }
  var filter = {_id:userId,'addresses.addressId':addressId};
  userService.findOne(filter, '', function(err, userFind) {
      if(err) return res.status(400).json({
        code: "ValidationError",
        message: "The given address id is not valid"
      });
      if(!userFind){
        return res.status(404).json({
          "code": "AuthCredentialNotExists",
          "message": "Address/user does not exist"
        });
      }
      userService.update(filter, {'$set':
        { 'addresses.$.label': req.body.label,
          'addresses.$.address1': req.body.address1,
          'addresses.$.address2': req.body.address2,
          'addresses.$.city': req.body.city,
          'addresses.$.state': req.body.state,
          'addresses.$.country': req.body.country,
          'addresses.$.zipCode': req.body.zipCode
        }}, function(err, data){
        if(err) {
          return res.status(404).json({
            "code": "AuthCredentialNotExists",
            "message": "Address/user does not exist"
          });
        }
        res.status(200).json({addressId:addressId});
      });
    }
  );
};

exports.delete = function(req, res, next) {
  if(!req.params && !req.params.addressId) {
    return res.status(400).json({
      "code": "ValidationError",
      "message": "Address Id is required"
    });
  }
  var addressId;
  var userId;
  try {
    userId = mongoose.Types.ObjectId(req.params.userId);
    addressId = mongoose.Types.ObjectId(req.params.addressId);
  }
  catch (err) {
    return res.status(400).json({
      code: "ValidationError",
      message: "The given address/user id is not valid"
    });
  }
  var filter = {_id:userId,'addresses.addressId':addressId};
  userService.findOne(filter,{addresses: {$elemMatch: {'addressId': addressId}}}, function(err, userFind) {
      if(err) {
        return res.status(404).json({
          "code": "AuthCredentialNotExists",
          "message": "Address does not exist"
        });
      }
      if(!userFind){
        return res.status(404).json({
          "code": "AuthCredentialNotExists",
          "message": "Address does not exist"
        });
      }
      userService.update(filter, { $pull: { "addresses" : { 'addressId': addressId} } },function(err,data){
        if(err) {
          return res.status(404).json({
            "code": "AuthCredentialNotExists",
            "message": "Address does not exist"
          });
        }
        return res.status(200).json({});
      });

    }
  );
};
