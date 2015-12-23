'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContactsSchema = new Schema({
  label: String,
  type: String,
  value: String
});

module.exports = mongoose.model('Contact', ContactsSchema);