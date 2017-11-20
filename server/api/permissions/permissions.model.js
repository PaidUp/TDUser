'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PermissionSchema = new Schema({
  roles: { type: [String], required: true},
  service: {type: String, required: true},
  module: {type: String, required: true},
  action: {type: String, required: true},
  grant: {type: Boolean, required: true},
  createAt: {type: Date, default: new Date()}
});
module.exports.schema = PermissionSchema;
module.exports = mongoose.model('tduser_permission', PermissionSchema);