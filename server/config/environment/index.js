'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9001,

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'tduser-secret'
  },

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      },
      prefix: 'tduser_'
    }
  },

  TDTokens:{
    me:'TDUserToken-CHANGE-ME!'
  },

  logger:{
    level: {
      info:'info',
      warn:'warn',
      error:'error'
    },
    loggly:{
      inputToken:'e2834f96-0326-43f1-8fd9-04dd669a11ef',
      subdomain: "cstest",
      tags: ["TDUser"],
      level: 'error'
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
  emailOptionsAlerts:{
    from: 'TDUser  <user@tduser.com>',
    subject: 'Default Subject'
  },
  emailHooks:{
    welcome: process.env.welcomeEmailHook || 'http://localhost:9000/api/v1/user/email/sendWelcome',
    resetPassword: process.env.resetPasswordEmailHook || 'http://localhost:9000/api/v1/user/email/sendResetPassword'
  },
  emailAdpater: __dirname + '/../../api/auth/adapters/'+ (process.env.emailAdapter || 'auth.email.webhook.adapter.js'),
  isLoanUser : false,
  encryptKey:'PZ5oXv3v6Pq5JAPFI9MFbQ=='
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
