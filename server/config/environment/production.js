'use strict';

var mongoHost = process.env.TDUSER_MONGO_HOST || 'localhost';

// Production specific configuration
// =================================
module.exports = {
  // Server port
  port: process.env.PORT || 9201,
  mongo: {
    uri: 'mongodb://' + mongoHost + '/tduser',
    options: {
      prefix: 'tduser_'
    }
  },

};
