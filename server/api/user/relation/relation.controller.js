'use strict';

var Relation = require('./relation.model');
var relationService = require('./relation.service');

exports.create = function(req, res, next) {
  var relation = new Relation(req.body);
  if((! req.body.targetUserId) || (! req.body.sourceUserId) || (! req.body.type)) {
    return res.status(404).json({
      "code": "AuthCredentialNotExists",
      "message": "User Id does not exist"
    });
  }
  relationService.save(relation, function(err, data) {
    if(err) return res.status(500).json(err);
    return res.status(200).json({});
  });
};

exports.list = function(req, res, next) {
  var userId = req.params.userId;
  var filter = {sourceUserId:userId};
  relationService.find(filter,'-sourceUserId -_id -__v', function(err, relationFind) {
    if(err) return res.status(500).json(err);
    if(!relationFind){
      return res.status(404).json({
        "code": "AuthCredentialNotExists",
        "message": "User Id does not exist"
      });
    }
    res.status(200).json(relationFind);
  });
};
