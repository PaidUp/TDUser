'use strict'

var mongoHost = process.env.TDUSER_MONGO_HOST || 'localhost'

// development specific configuration
// =================================
module.exports = {
  // Server port
  port: process.env.PORT || 9001,
  mongo: {
    uri: 'mongodb://' + mongoHost + '/convenience-dev',
    options: {
      prefix: 'tduser_'
    }
  }

}
