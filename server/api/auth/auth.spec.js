'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var assert = require('chai').assert;
var authEmailService = require('./auth.email.service');
var User = require('../user/user.model');
var authService = require('./auth.service');
var uuid = require('node-uuid');
var authController = require('./auth.controller');
var logger = require('../../config/logger');
var user;
var token;
var faker = require('faker');
var tokenTDUser = 'TDUserToken-CHANGE-ME!';

before('auth before', function(){
  it('signup user', function(done){
    user = new User({
      firstName : faker.name.firstName() + ' 2',
      lastName : faker.name.lastName() + ' 3'
    });
    user.save();
    done();
  });

  it('/signup', function(done) {
    request(app)
      .post('/api/v1/auth/local/signup')
      .set('Authorization', tokenTDUser)
      .send({
        "userId": user.id,
        "email": faker.internet.email(),
        "password": "Qwerty1!",
        "rememberMe": true
      })
      .expect(200)
      //.expect('Content-Type', 'application/json')
      .end(function(err, res) {
        if (err) return done(err);
        token = res.body.token;
        done();
      });
  });
});

describe('auth.email.service', function() {

  it.skip('sendWelcomeEmail', function (done) {
    this.timeout(5000);
    authEmailService.sendWelcomeEmail(user, function (err, data) {
      if (err) {
        logger.info(err, err);
      }
      assert(!err);
      done();
    });
  });

  it('sendWelcomeTokenEmail', function (done) {
    this.timeout(5000);
    var user = new User({
      firstName: "TDUser",
      lastName: "dummy",
      email: "jesse.cogollo@talosdigital.com"
    });
    var token = uuid.v4();
    authEmailService.sendWelcomeTokenEmail(user, token, function (err, data) {
      if (err) {
        logger.info(err, err);
      }
      assert(!err);
      done();
    });
  });

  it('sendResetTokenEmail', function (done) {
    this.timeout(5000);
    var user = new User({
      firstName: "TDUser",
      lastName: "dummy",
      email: "jesse.cogollo@talosdigital.com"
    });
    var token = uuid.v4();
    authEmailService.sendResetTokenEmail(user, token, function (err, data) {
      if (err) {
        logger.info(err, err);
      }
      assert(!err);
      done();
    });
  });
});

describe('auth.service', function(){
  this.timeout(5000);
  it('isValidEmail Ok', function(done){
    var email = 'jesse.cogollo@talosdigital.com';
    var validation = authService.isValidEmail(email);
    assert(validation);
    done();
  });

  it('isValidEmail fail', function(done){
    var email = 'jesse.cogollo@talosdigital.com.';
    var validation = authService.isValidEmail(email);
    assert(!validation);
    done();
  });

  it('verifyEmailRequest', function(done){
    this.timeout(12500);
    authService.verifyEmailRequest(user, function(err, data){
      if(err) done(err);
      // logger.warn(data);
      assert.equal(data.user.email, user.email);
      assert.equal(data.user.firstName, user.firstName);
      assert.equal(data.user.lastName, user.lastName);
      done();
    });
  });

  it('ResetPassword', function(done){
    this.timeout(12500);
    authService.ResetPassword(user, function(err, data){
      if(err) done(err);
      assert.equal(data.user.email, user.email);
      assert.equal(data.user.firstName, user.firstName);
      assert.equal(data.user.lastName, user.lastName);
      done();
    });
  });

  it('validationPasswordSync Ok', function(done){
    var password = '!1Aqwerty';
    var validation = authService.validationPasswordSync(password);
    //assert.equal(validation, '');
    done();
  });

  it('validationPasswordSync empty ', function(done){
    var password = undefined;
    var validation = authService.validationPasswordSync(password);
    assert.equal(validation, 'Password can\'t be blank');
    done();
  });

  it('validationPasswordSync fail ', function(done){
    var password = '';
    var validation = authService.validationPasswordSync(password);
    //assert.equal(validation, 'less than 8 characters No lowerCase No upperCase No specialCharacter');
    done();
  });

  it('validationPasswordSync fail querty', function(done){
    var password = 'querty';
    var validation = authService.validationPasswordSync(password);
    //assert.equal(validation, 'less than 8 characters No upperCase No specialCharacter');
    done();
  });

  it('validationPasswordSync fail !Aq*', function(done){
    var password = '!Aq*';
    var validation = authService.validationPasswordSync(password);
    assert.equal(validation, 'less than 8 characters');
    done();
  });

  it('validationPasswordSync fail TDUser123', function(done){
    var password = 'TDUser123';
    var validation = authService.validationPasswordSync(password);
    //assert.equal(validation, ' No specialCharacter');
    done();
  });
});
