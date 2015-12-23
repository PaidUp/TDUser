'use strict';

var mongoose = require('mongoose');
var Relation = require('./relation.model.js');

function save(relation, cb) {
  relation.save(function(err, data) {
    if(err) {
      return cb(err);
    }
    return cb(null, data);
  });
}

function find(filter,fields, cb) {
  Relation.find(filter,fields, function(err, data) {
      if(err) {
        return cb(err);
      }
      return cb(null, data);
    }
  );
}

exports.save = save;
exports.find = find;