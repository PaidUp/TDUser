'use strict';

var config = require('../../../config/environment');
var request = require('request');
var logger = require('../../../config/logger');

exports.sendWelcomeTokenEmail = function(user, token, cb){
	sendRequest({user:user, token:token, action: 'CREATED_USER'}, config.emailHooks.welcome, cb);
}

exports.sendResetTokenEmail = function(user, token, cb){
	sendRequest({user:user, token:token, action: 'RESET_PASSWORD_REQUESTED'}, config.emailHooks.resetPassword, cb);
}

function sendRequest (body, url, cb){
	request({
		url: url,
		method: "POST",
		json: true,
		body: body
	}, function(err, response, body) {
		if (err) {
			if(err.code === 'ECONNREFUSED'){
				if(config.env != 'test'){
					logger.warn('Couldn\'t reach:', url, err);
				}
				return cb(null, false);
			}
			if(config.env != 'test'){
				logger.error('Something went wrong with the webhook adpater:', JSON.stringify(err));
			}
			return cb(null, false);
		}
		if (response.statusCode >= 400) {
			if(config.env != 'test'){
				logger.warn('Couldn\'t post webhook:', url, 'Status:', response.statusCode, 'Data:', body);
			}
			return cb(null, response.statusCode);
		}
		cb(null, true);
	});	
}
