'use strict';

var config = require('./environment');
var winston = require('winston');
require('winston-loggly');

let env = process.env.NODE_ENV;

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: config.logger.level.info,
        handleExceptions: true,
        json: true,
        colorize: true
      }),
      new (winston.transports.File)({
        level: config.logger.level.warn,
        handleExceptions: true,
        json: true,
        colorize: true,
        filename: config.root + '/var/logs/all-logs.log',
        maxsize: 5242880, //5MB
        maxFiles: 5
      }),
      new (winston.transports.Loggly)({
        level: config.logger.loggly.level,
        handleExceptions: true,
        json: true,
        inputToken: config.logger.loggly.inputToken,
        subdomain: config.logger.loggly.subdomain,
        tags: config.logger.loggly.tags
      })
    ],
    exitOnError: false
  });

winston.emitErrs = true;

if(env === 'test'){
  logger
    .remove(winston.transports.File)
    .remove(winston.transports.Console)
    .remove(winston.transports.Loggly);
}

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding){
    logger.info(message);
  }
};
