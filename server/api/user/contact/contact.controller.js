'use strict';

var Contact = require('./contact.model');
var contactService = require('./contact.service');
var userService = require('../user.service');
var mongoose = require('mongoose');

exports.create = function(req, res, next) {
  var userId = req.params.userId;
  var idContact = mongoose.Types.ObjectId();
  var userUpdate = req.body.userId;
  var isValidTypeContact = contactService.validateTypeContactSync(req.body.type);
  if(!isValidTypeContact){
    return res.status(400).json({
      "code": "ValidationError",
      "message": "Contact Type is not accepted"
    });
  }
  var filter = {_id:userId};
  if(userUpdate != userId) {
    filter = {createdBy : userId, _id:userUpdate};
  }
  userService.findOne(filter, '', function(err, userFind) {
    if(err) return res.status(409).json(res, err);
    if(!userFind){
      return res.status(404).json({
        "code": "AuthCredentialNotExists",
        "message": "User Id does not exist"
      });
    }
    var contacts = {
      contactId : idContact,
      label : req.body.label,
      type : req.body.type,
      value : req.body.value
    };
    userFind.contacts.push(contacts);
    userService.save(userFind, function(err, userSave) {
      if(err) {
        return res.status(404).json({
          "code": "AuthCredentialNotExists",
          "message": "User contact id does exist"
        });
      }
      res.status(200).json({contactId:idContact});
    });
  });
};

exports.list = function(req, res, next) {
  var userId = req.params.userId;
  var userUpdate = req.body.userId;
  var filter = userId;
  if(userUpdate != userId) {
    filter = userUpdate;
  }
  userService.findOne({_id:filter},'-contacts.label -contacts.value', function(err, userFind) {
    if(err) return res.status(400).json({
      code: 'ValidationError',
      message: 'The given user id is invalid'
    });
    if(!userFind || filter != userFind.id){
      return res.status(404).json({
        "code": "AuthCredentialNotExists",
        "message": "User contact id does not exist"
      });
    }
    res.status(200).json(userFind.contacts);
  });
};

exports.load = function(req, res, next) {
  if(!req.params && !req.params.contactId) {
    return res.status(400).json({
      "code": "ValidationError",
      "message": "Contact Id is required"
    });
  }
  var idContact;
  var userId;
  try {
    userId = mongoose.Types.ObjectId(req.params.userId);
    idContact = mongoose.Types.ObjectId(req.params.contactId);
  }
  catch (err) {
    return res.status(400).json({
      code: "ValidationError",
      message: "The given contact id is not valid"
    });
  }
  var filter = {_id:userId,'contacts.contactId':idContact};
  userService.findOne(filter,{contacts: {$elemMatch: {'contactId': idContact}}}, function(err, userFind) {
      if(err) return res.status(400).json({
        code: "ValidationError",
        message: "The given contact id is not valid"
      });
      if(!userFind){
        return res.status(404).json({
          "code": "AuthCredentialNotExists",
          "message": "Telephone does not exist"
        });
      }
      return res.status(200).json(userFind.contacts[0]);
    }
  );
};

exports.update = function(req, res, next) {
  var userId = req.params.userId;
  var userUpdate = req.body.userId;
  if(!req.params && !req.params.contactId) {
    return res.status(400).json({
      "code": "ValidationError",
      "message": "Contact Id is required"
    });
  }
  var userId;
  var contacts;
  try {
    userId = mongoose.Types.ObjectId(req.params.userId);
    contacts = mongoose.Types.ObjectId(req.params.contactId);
  }
  catch (err) {
    return res.status(400).json({
      code: "ValidationError",
      message: "The given contact id is not valid"
    });
  }
  var filter = {_id:userId,'contacts.contactId':contacts};
  if(userUpdate != userId) {
    filter = {createdBy : userId, _id:userUpdate,'contacts.contactId':contacts};
  }
  userService.findOne(filter, '', function(err, userFind) {
    if(err) return res.status(400).json({
      code: "ValidationError",
      message: "The given contact id is not valid"
    });
    if(!userFind){
      return res.status(404).json({
        "code": "AuthCredentialNotExists",
        "message": "Telephone/user does not exist"
      });
    }
    userService.update(filter, {'$set': {'contacts.$.value': req.body.value}}, function(err, data){
      if(err) {
        return res.status(404).json({
          "code": "AuthCredentialNotExists",
          "message": "User contact/user id does not update"
        });
      }
      res.status(200).json({contactId:contacts});
    });
  });
};

exports.delete = function(req, res, next) {
  if(!req.params && !req.params.contactId) {
    return res.status(400).json({
      "code": "ValidationError",
      "message": "Contact Id is required"
    });
  }
  var userId;
  var contactId;
  try {
    userId = mongoose.Types.ObjectId(req.params.userId);
    contactId = mongoose.Types.ObjectId(req.params.contactId);
  }
  catch (err) {
    return res.status(400).json({
      code: "ValidationError",
      message: "The given contact id is not valid"
    });
  }
  var filter = {_id:userId,'contacts.contactId':contactId};
  userService.findOne(filter,{contacts: {$elemMatch: {'contactId': contactId}}}, function(err, userFind) {
      if(err) return res.status(400).json({
        code: "ValidationError",
        message: "The given contact id is not valid"
      });
      if(!userFind){
        return res.status(404).json({
          "code": "AuthCredentialNotExists",
          "message": "Contact does not exists"
        });
      }
      userService.update(filter, { $pull: { "contacts" : { 'contactId': contactId} } },function(err,data){
        if(err) {
          return res.status(404).json({
            "code": "AuthCredentialNotExists",
            "message": "User contact id does not delete"
          });
        }
        return res.status(200).json({});
      });

    }
  );
};
