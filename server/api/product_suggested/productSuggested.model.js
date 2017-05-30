'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProductSuggestedSchema = new Schema({
  email: { type: String, required: true},
  category: {type: String, default: ''},
  product: {type: String, default: ''},
  paymentPlan: {type: String, default: ''},
  createAt: {type: Date, default: new Date()},
});

module.exports = mongoose.model('tduser_produc', ProductSuggestedSchema);