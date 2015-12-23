var nock = require('nock');
var assert = require('chai').assert;
var logger = require('../../../config/logger');
var faker = require('faker');

//adapter to test
var webhook = require('./auth.email.webhook.adapter');



describe('auth.email.webhook.adapter', function() {
	beforeEach('webhook before', function() {
		// nock('http://localhost:9003')
		// 	.post('/test/email/sendResetPassword')
		// 	.reply(function(uri, requestBody) {
		// 		return [201, 'THIS IS THE REPLY BODY'];
		// 	});
	});

	it('sendWelcomeEventWelcome', function(done) {
		nock('http://localhost:9000')
			.post('/api/v1/email/sendWelcome')
			.reply(function(uri, requestBody) {
				body = JSON.parse(requestBody)
				assert.equal(body.action, 'CREATED_USER');
				assert.notEqual(!body.user);
				assert.notEqual(!body.token);
				return [201, {data:'ok'}];
			});
		webhook.sendWelcomeTokenEmail({
			"userId": 'someId',
			"email": faker.internet.email(),
			"password": "Qwerty1!",
			"rememberMe": true
		}, 'some_token', function(err, data) {
			assert(!err);
			nock.cleanAll()
			done()
		});
	});

	it('sendWelcomeEventPassword', function(done) {
		nock('http://localhost:9000')
			.post('/api/v1/email/sendResetPassword')
			.reply(function(uri, requestBody) {
				body = JSON.parse(requestBody)
				assert.equal(body.action, 'RESET_PASSWORD_REQUESTED');
				assert.notEqual(!body.user);
				assert.notEqual(!body.token);
				return [201, {data:'ok'}];
			});
		webhook.sendResetTokenEmail({
			"userId": 'someId',
			"email": faker.internet.email(),
			"password": "Qwerty1!",
			"rememberMe": true
		}, 'some_token', function(err, data) {
			assert(!err);
			nock.cleanAll()
			done()
		});
	});

});