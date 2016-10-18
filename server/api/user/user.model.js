'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var config = require('../../config/environment/index.js');

var UserTeamSchema = new Schema({
  sku: {type: String},
  productId: {type: String},
  createAt: {type: Date, default: new Date()},
  seasonEnd: {type: Date, default: new Date()},
  name: {type: String}
});

var UserSchema = new Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    birthDate: { type: Date },
    createdBy: String,
    createAt: {type: Date, default: new Date()},
    updateAt: {type: Date, default: new Date()},
    email: { type: String, lowercase: true },
    role: {
      type: String,
      default: 'user'
    },
    verify: {
      token: String,
      updatedAt: String,
      status: String,
      email: String
    },
    resetPassword : {
      status : String,
      token : String,
      updatedAt : String
    },
    roles: {
      type: Array,
      default: ['user']
    },
    hashedPassword: String,
    provider: String,
    salt: String,
    facebook: {
      id: String,
      email:String
    },
    github: {},
    contacts:{
      type: Array
    },
    addresses:{
      type: Array
    },
    gender: String,
    payment: {},
    ssn: String,
    teams: [UserTeamSchema],
    meta:{
      TDPaymentId:{
        type: String,
        default: ''
      },
      TDCommerceId:{
        type: String,
        default: ''
      },
      providerStatus:{
        type: String,
        default: ''
      },
      productRelated:{
        type: Array,
        default: []
      },
      data: {
        type: Object,
        default: {}
      },
      getFrom:{
        type: String,
        default: ''
      },
      productsSuggested:{
        type: Object,
        default: {}
      }
    }
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();
    this.update_at = new Date();
    next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  },
  /**
   * Add a Role to the User
   * @param role
   */
  addRole: function(roleName) {
    if(! this.hasRole(roleName)) {
      this.roles.push(roleName);
      return true;
    }
    else {
      return false;
    }
  },

  hasRole: function(roleName) {
    if(this.roles.indexOf(roleName) > -1) {
      return true;
    }
    return false;
  },

  getFullName: function() {
    return this.firstName + " " + this.lastName;
  }
};

module.exports = mongoose.model('User', UserSchema, config.mongo.options.prefix + 'users');
