'use strict';
var path = require('path');

// Test specific configuration
// ===========================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/tduser-test',
    options: {
      prefix: 'tduser_'
    }
  },
  // Email system
  emailService:{
    service: 'Gmail',
    auth: {
      user: 'user@tduser.com',
      pass: 'xxx'
    }
  },
  emailHooks:{
    welcome: process.env.welcomeEmailHook || 'http://localhost:9000/api/v1/user/email/sendWelcome',
    resetPassword: process.env.resetPasswordEmailHook || 'http://localhost:9000/api/v1/user/email/sendResetPassword'
  },
  emailTemplateRoot:path.normalize(__dirname + '/../../../server/views/default'),
  isLoanUser: false
};
