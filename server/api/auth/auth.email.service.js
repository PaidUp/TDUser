/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';
var config = require('../../config/environment');
var adapter = require(config.emailAdpater);

exports.sendWelcomeTokenEmail = function(user, token, cb) {
	user = cleanUser(user);
  adapter.sendWelcomeTokenEmail(user, token, function(){
		cb(null, {user:user, emailToken:token})	
  });
};

exports.sendResetTokenEmail = function(user, token, cb) {
	user = cleanUser(user);
  adapter.sendResetTokenEmail(user, token, function(){
  	cb(null, {user:user, emailToken:token})	
  });
};

function cleanUser(user){
	var cleanedUser = {};
	cleanedUser.email = user.email;
	cleanedUser.firstName = user.firstName;
	cleanedUser.lastName = user.lastName;
	return cleanedUser;
}