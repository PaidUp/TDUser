'use strict';
var config = require('./environment');
var fs = require( 'fs' );
var logDir = config.root + '/var/logs'; // directory path you want to set
if ( !fs.existsSync( logDir ) ) {
    // Create the directory if it does not exist
    fs.mkdirSync( config.root + '/var' );
    fs.mkdirSync( config.root + '/var/logs' );
}
var winston = require('winston');
winston.emitErrs = true;

var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: config.root + '/var/logs/all-logs.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding){
    logger.info(message);
  }
};
