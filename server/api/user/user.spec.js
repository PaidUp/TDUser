'use strict';

var app = require('../../app');
var request = require('supertest');
var assert = require('chai').assert;
var User = require("../../api/user/user.model");
var userService = require("../../api/user/user.service");
var moment = require('moment');
var userSpecModel = require('./user.model.spec');
var tokenTDUser = 'TDUserToken-CHANGE-ME!';

describe('User', function() {
  this.timeout(10000);
  describe('user and auth controller', function() {
      it('/user/create', function(done) {
        delete userSpecModel.user.id;
        delete userSpecModel.user.birthDate;
        request(app)
          .post('/api/v1/user/create')
          .set('Authorization', tokenTDUser)
          .send({
            firstName : userSpecModel.user.firstName,
            lastName : userSpecModel.user.lastName
          })
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            userSpecModel.user.id = res.body.userId;
            assert(res.body.userId);
            done();
          });
      });

      it('/auth/local/signup', function(done) {
        var credentialFake = {
          userId: userSpecModel.user.id,
          email: userSpecModel.user.email,
          password: userSpecModel.user.password,
          rememberMe: true
        };
        request(app)
          .post('/api/v1/auth/local/signup')
          .set('Authorization', tokenTDUser)
          .send(credentialFake)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert(res.body.token);
            userSpecModel.user.token = res.body.token;
            done();
          });
      });

      it('user/current', function(done) {
        request(app)
          .get('/api/v1/user/current/?token='+userSpecModel.user.token)
          .set('Authorization', tokenTDUser)
          .expect(200)
          .end(function(err, res) {
            assert(res.body._id);
            assert(res.body.email);
            assert.equal(res.body._id, userSpecModel.user.id)
            done();
          });
      });

      it('fails user/current when token is invalid', function(done) {
        request(app)
          .get('/api/v1/user/current/?token=hi')
          .set('Authorization', tokenTDUser)
          .expect(401)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/auth/logout', function(done) {
        request(app)
          .get('/api/v1/auth/logout/userId/'+userSpecModel.user.id)
          .set('Authorization', tokenTDUser)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/auth/local/login', function(done) {
        var credentials = {
          email: userSpecModel.user.email,
          password: userSpecModel.user.password,
          rememberMe: true
        };
        request(app)
          .post('/api/v1/auth/local/login')
          .set('Authorization', tokenTDUser)
          .send(credentials)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            assert(res.body.token);
            if (err) return done(err);
            done();
          });
      });
      //here end common pass for all test.
      it('/auth/verify-request', function(done) {
        request(app)
          .get('/api/v1/auth/verify-request/userId/'+userSpecModel.user.id)
          .set('Authorization', tokenTDUser)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/auth/verify', function(done) {
        var data = {
          verifyToken: userSpecModel.user.verifyToken
        };
        request(app)
          .post('/api/v1/auth/verify')
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/auth/password/reset-request', function(done) {
        var data = {
          email: userSpecModel.user.email
        }
        request(app)
          .post('/api/v1/auth/password/reset-request')
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('fails in /auth/password/reset-request', function(done) {
        var data = {
          email: userSpecModel.userBad.email
        }
        request(app)
          .post('/api/v1/auth/password/reset-request')
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/auth/password/reset', function(done) {
        var data = {
          verifyToken: userSpecModel.user.verifyToken,
          password: userSpecModel.user.password
        }
        request(app)
          .post('/api/v1/auth/password/reset')
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });
/*
      it('/auth/password/update', function(done) {
        var data = {
          newPassword: userSpecModel.user.password,
          currentPassword: userSpecModel.user.password
        }
        request(app)
          .post('/api/v1/auth/password/update/userId/'+userSpecModel.user.id)
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });
*/

      it('/auth/email/update fail, invalid email', function(done) {
        var data = {
          email: 'userSpecModel.user.newEmail',
          userId: 'userSpecModel.user.id'
        }
        request(app)
          .post('/api/v1/auth/email/update/userId/'+'userSpecModel.user.id')
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            assert.equal(res.body.message, 'email is not accepted');
            if (err) return done(err);

            done();
          });
      });

      it('/auth/email/update fail, without permission', function(done) {
        var data = {
          email: userSpecModel.user.newEmail,
          userId: 'userSpecModel.user.id'
        }
        request(app)
          .post('/api/v1/auth/email/update/userId/'+'userSpecModel.user.id')
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(403)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            assert.equal(res.body.message, 'You don\'t have permission for this operation');
            if (err) return done(err);
            done();
          });
      });

      it('/auth/email/update', function(done) {
        var data = {
          email: userSpecModel.user.newEmail,
          userId: userSpecModel.user.id
        }
        request(app)
          .post('/api/v1/auth/email/update/userId/'+userSpecModel.user.id)
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/user/update', function(done) {
        var data = {
          userId: userSpecModel.user.id,
          firstName: userSpecModel.user.firstName,
          lastName: userSpecModel.user.lastName,
          gender: userSpecModel.user.gender,
          birthDate: userSpecModel.user.birthDate
        }
        request(app)
          .post('/api/v1/user/update/userId/'+userSpecModel.user.id)
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert(res.body);
            done();
          });
      });

      it('/user/find', function(done) {
        var filter = {};
        request(app)
          .post('/api/v1/user/find')
          .set('Authorization', tokenTDUser)
          .send(filter)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert(res.body);
            done();
          });
      });

      //End test user
      //test contact user

      it('/user/contact/create/', function(done) {
        var data = {
          userId: userSpecModel.user.id,
          label: userSpecModel.user.label,
          type: userSpecModel.user.type,
          value: userSpecModel.user.valueContact
        }
        request(app)
          .post('/api/v1/user/contact/create/userId/'+userSpecModel.user.id)
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            userSpecModel.user.contactId = res.body.contactId;
            assert(res.body.contactId);
            done();
          });
      });

      it('/user/contact/create/ fails when user id doesn\'t exist', function(done) {
        var data = {
          userId: userSpecModel.user.id,
          label: userSpecModel.user.label,
          type: userSpecModel.user.type,
          value: userSpecModel.user.valueContact
        }
        request(app)
          .post('/api/v1/user/contact/create/userId/abc')
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(404)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/user/contact/list/', function(done) {
        var data = {
          userId: userSpecModel.user.id,
        }
        request(app)
          .post('/api/v1/user/contact/list/userId/'+userSpecModel.user.id)
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert.operator(res.body.length, '>', 0);
            done();
          });
      });

      it('/user/contact/list/ fails when user id is invalid', function(done) {
        var data = {
          userId: 'abc'
        };
        request(app)
          .post('/api/v1/user/contact/list/userId/' + data.userId)
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/user/contact/load/', function(done) {
        request(app)
          .get('/api/v1/user/contact/load/userId/'+userSpecModel.user.id+'/contactId/'+userSpecModel.user.contactId)
          .set('Authorization', tokenTDUser)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert(res.body.contactId);
            assert(res.body.label);
            assert(res.body.type);
            assert(res.body.value);
            done();
          });
      });

      it('/user/contact/load/ fails with an invalid contactId', function(done) {
        request(app)
          .get('/api/v1/user/contact/load/userId/'+userSpecModel.user.id+'/contactId/123')
          .set('Authorization', tokenTDUser)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/user/contact/update/', function(done) {
        var data = {
          userId: userSpecModel.user.id,
          value: userSpecModel.user.valueContact
        }
        request(app)
          .put('/api/v1/user/contact/update/userId/'+userSpecModel.user.id+'/contactId/'+userSpecModel.user.contactId)
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert(res.body.contactId);
            done();
          });
      });

      it('/user/contact/update/ fails when contact id is invalid', function(done) {
        var data = {
          userId: userSpecModel.user.id,
          value: userSpecModel.user.valueContact
        }
        request(app)
          .put('/api/v1/user/contact/update/userId/'+userSpecModel.user.id+'/contactId/abcd')
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/user/contact/delete/', function(done) {
        request(app)
          .delete('/api/v1/user/contact/delete/userId/'+userSpecModel.user.id+'/contactId/'+userSpecModel.user.contactId)
          .set('Authorization', tokenTDUser)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert(res.body);
            done();
          });
      });

      it('/user/contact/delete/ fails when contact id is invalid', function(done) {
        request(app)
          .delete('/api/v1/user/contact/delete/userId/'+userSpecModel.user.id+'/contactId/abc123')
          .set('Authorization', tokenTDUser)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert(res.body);
            done();
          });
      });

      //End test contact user
      //test address user

      it('/user/address/create/', function(done) {
        var data = {
          type: userSpecModel.user.typeAddress,
          label : userSpecModel.user.labelAddress,
          address1 : userSpecModel.user.address1,
          address2 : userSpecModel.user.address2,
          city : userSpecModel.user.city,
          state : userSpecModel.user.state,
          country : userSpecModel.user.country,
          zipCode : userSpecModel.user.zipCode
        }
        request(app)
          .post('/api/v1/user/address/create/userId/'+userSpecModel.user.id)
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            userSpecModel.user.addressId = res.body.addressId;
            assert(res.body.addressId);
            done();
          });
      });

      it('/user/address/list/', function(done) {
        var data = {
          userId: userSpecModel.user.id,
        }
        request(app)
          .post('/api/v1/user/address/list/userId/'+userSpecModel.user.id)
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert.operator(res.body.length, '>', 0);
            done();
          });
      });

      it('fails /user/address/list/ when id is invalid', function(done) {
        var data = {
          userId: userSpecModel.userBad.id,
        }
        request(app)
          .post('/api/v1/user/address/list/userId/'+userSpecModel.userBad.id)
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/user/address/load/', function(done) {
        request(app)
          .get('/api/v1/user/address/load/userId/'+userSpecModel.user.id+'/addressId/'+userSpecModel.user.addressId)
          .set('Authorization', tokenTDUser)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert(res.body.addressId);
            assert(res.body.label);
            assert(res.body.type);
            assert(res.body.address1);
            assert(res.body.address2);
            assert(res.body.city);
            assert(res.body.state);
            assert(res.body.country);
            assert(res.body.zipCode);
            done();
          });
      });

      it('/user/address/load/ fails when address id is invalid', function(done) {
        request(app)
          .get('/api/v1/user/address/load/userId/'+userSpecModel.user.id+'/addressId/abc')
          .set('Authorization', tokenTDUser)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/user/address/update/', function(done) {
        var data = {
          label : userSpecModel.user.labelAddress,
          address1 : userSpecModel.user.address1,
          address2 : userSpecModel.user.address2,
          city : userSpecModel.user.city,
          state : userSpecModel.user.state,
          country : userSpecModel.user.country,
          zipCode : userSpecModel.user.zipCode
        }
        request(app)
          .put('/api/v1/user/address/update/userId/'+userSpecModel.user.id+'/addressId/'+userSpecModel.user.addressId)
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert(res.body.addressId);
            done();
          });
      });

      it('/user/address/update/ when addressId is invalid', function(done) {
        var data = {
          label : userSpecModel.user.labelAddress,
          address1 : userSpecModel.user.address1,
          address2 : userSpecModel.user.address2,
          city : userSpecModel.user.city,
          state : userSpecModel.user.state,
          country : userSpecModel.user.country,
          zipCode : userSpecModel.user.zipCode
        }
        request(app)
          .put('/api/v1/user/address/update/userId/'+userSpecModel.user.id+'/addressId/abc')
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/user/address/delete/', function(done) {
        request(app)
          .delete('/api/v1/user/address/delete/userId/'+userSpecModel.user.id+'/addressId/'+userSpecModel.user.addressId)
          .set('Authorization', tokenTDUser)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert(res.body);
            done();
          });
      });

      it('/user/address/delete/ when addressId is invalid', function(done) {
        request(app)
          .delete('/api/v1/user/address/delete/userId/'+userSpecModel.user.id+'/addressId/abc')
          .set('Authorization', tokenTDUser)
          .expect(400)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      //End test address user
      //test relation user

      it('/user/create (child)', function(done) {
        request(app)
          .post('/api/v1/user/create')
          .set('Authorization', tokenTDUser)
          .send({
            userId: userSpecModel.user.id,
            firstName : userSpecModel.user.firstNameChild,
            lastName : userSpecModel.user.lastNameChild,
            birthDate : userSpecModel.user.birthDate,
            height : userSpecModel.user.height,
            weight : userSpecModel.user.weight,
            gender : userSpecModel.user.gender
          })
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            userSpecModel.user.idChild = res.body.userId;
            assert(res.body.userId);
            done();
          });
      });

      it('/user/relation/create', function(done) {
        var data = {
          sourceUserId: userSpecModel.user.id,
          targetUserId : userSpecModel.user.idChild,
          type: userSpecModel.user.typeRelation
        };
        request(app)
          .post('/api/v1/user/relation/create')
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            done();
          });
      });

      it('/user/relation/list/', function(done) {
        request(app)
          .get('/api/v1/user/relation/list/userId/'+userSpecModel.user.id)
          .set('Authorization', tokenTDUser)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert.operator(res.body.length, '>', 0);
            done();
          });
      });

      //End test relation user
      //test generic
      it('/user/save', function(done) {
        var data = {
          _id: userSpecModel.user.id,
          firstName: 'save !!!',
          lastName: userSpecModel.user.lastName,
          gender: userSpecModel.user.gender,
          birthDate: userSpecModel.user.birthDate,
          hashedPassword:''
        }
        request(app)
          .post('/api/v1/user/save')
          .set('Authorization', tokenTDUser)
          .send(data)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end(function(err, res) {
            if (err) return done(err);
            assert(res.body);
            done();
          });
      });

  });

  describe('user.service', function() {

    it('save', function (done) {
      var user = new User({
        firstName: userSpecModel.user.firstName,
        lastName: userSpecModel.user.lastName
      });
      userService.save(user, function(err, data){
        assert.equal(err, null);
        assert(data._id);
        done();
      });
    });

      it("allows to save an object", function (done) {
        var user = new User({
          firstName: userSpecModel.user.firstName,
          lastName: userSpecModel.user.lastName,
          meta: {
            data: {
              myKey1: "1",
              myKey2: 2,
              myKey3: {
                myKey4: 4.0
              }
            }
          }
        });
        userService.save(user, function(err, data){
          assert.equal(err, null);
          assert(data._id);
          assert.isDefined(data.meta);
          done();
        });
      });
    });

    it('create', function (done) {
      var user = new User({
        firstName: userSpecModel.user.firstName,
        lastName: userSpecModel.user.lastName
      });
      userService.create(user, function(err, data){
        assert.equal(err, null);
        assert(data._id);
        done();
      });
    });

    it('findOne', function (done) {
      var filter = {};
      userService.findOne(filter,'', function(err, data){
        assert.equal(err, null);
        assert(data);
        done();
      });
    });

    it('find', function (done) {
      var filter = {};
      var fields = '-firstName';
      userService.find(filter,fields, function(err, data){
        assert.equal(err, null);
        assert(!data[0].firstName);
        done();
      });
    });

    it('mergeFacebookUser', function (done) {
      var user = new User({
        firstName: userSpecModel.user.firstName,
        lastName: userSpecModel.user.lastName
      });

      var fbUser = {
        first_name:userSpecModel.user.firstName,
        last_name:userSpecModel.user.lastName,
        id:userSpecModel.user.id,
        email:userSpecModel.user.email
      };

      userService.mergeFacebookUser({user:user,fbUser:fbUser}, function(err, data){
        assert.equal(err, null);
        assert(data);
        done();
      });
    });

    it('validateBirthDate Ok', function(done){
      var birthDate = userSpecModel.user.birthDate;
      var validation = userService.validateBirthDateSync(birthDate);
      assert(validation);
      done();
    });

    it('validateBirthDate fail', function(done){
      var birthDate = userSpecModel.userBad.birthDate;
      var validation = userService.validateBirthDateSync(birthDate);
      assert(!validation);
      done();
    });

    it('validateBirthDate future', function(done){
      var birthDate = userSpecModel.userBad.birthDate;
      var validation = userService.validateBirthDateSync(birthDate);
      assert(!validation);
      done();
    });

    it('validateFirstNameSync Ok', function(done){
      var firstName = userSpecModel.user.firstName;
      var validation = userService.validateFirstNameSync(firstName);
      assert(validation);
      done();
    });

    it('validateFirstNameSync fail', function(done){
      var firstName = userSpecModel.userBad.firstName;
      var validation = userService.validateFirstNameSync(firstName);
      assert(!validation);
      done();
    });

    it('validateFirstNameSync fail, more then 128 alfa characters.', function(done){
      var firstName = userSpecModel.user.firstName + ' the alfa characters more the alfa characters more the alfa characters more the alfa characters more the alfa characters wer. TDUser ';
      if(firstName.length > 128){
        var validation = userService.validateFirstNameSync(firstName);
        assert(!validation);
      }
      done();
    });

    it('validateOnlyLetterSync Ok', function(done){
      var word = userSpecModel.user.firstName;
      var validation = userService.validateOnlyLetterSync(word);
      assert(validation);
      done();
    });

    it('validateOnlyLetterSync fail', function(done){
      var word = userSpecModel.userBad.firstName;
      var validation = userService.validateOnlyLetterSync(word);
      assert(!validation);
      done();
    });

    it('validateLastNameSync Ok', function(done){
      var lastName = userSpecModel.user.lastName;
      var validation = userService.validateLastNameSync(lastName);
      assert(validation);
      done();
    });

    it('validateLastNameSync fail', function(done){
      var lastName = userSpecModel.userBad.lastName;
      var validation = userService.validateLastNameSync(lastName);
      assert(!validation);
      done();
    });

    it('validateLastNameSync fail, more then 128 alfa characters.', function(done){
      var lastName = userSpecModel.user.lastName + ' the alfa characters more the alfa characters more the alfa characters more the alfa characters more the alfa characters wer. TDUser ';
      if(lastName.length > 128){
        var validation = userService.validateLastNameSync(lastName);
        assert(!validation);
      }
      done();
    });

    it('validateGenderSync Ok male', function(done){
      var gender = userSpecModel.user.gender;
      var validation = userService.validateGenderSync(gender);
      assert(validation);
      done();
    });

    it('validateGenderSync fail masculino', function(done){
      var gender = userSpecModel.userBad.gender;
      var validation = userService.validateGenderSync(gender);
      assert(!validation);
      done();
    });

    it('verifySSN' , function(done){
      assert(userService.verifySSN(userSpecModel.user.ssn), 'SSN is not valid');
      done();
    });

    it('encryptSSN' , function(done){
      var encSSN = userService.encryptSSN(userSpecModel.user.ssn);
      assert(encSSN);
      userSpecModel.encryptValue = encSSN;
      done();
    });

    it('decryptSSN' , function(done){
      var SSN = userService.decryptSSN(userSpecModel.encryptValue);
      assert.equal(userSpecModel.user.ssn, SSN);
      done();
    });
  });
});
