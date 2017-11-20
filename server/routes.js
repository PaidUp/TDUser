/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var fs = require('fs');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/v1/user', require('./api/user'));
  app.use('/api/v1/auth', require('./api/auth'));
  app.use('/api/v1/product', require('./api/product_suggested'));
  app.use('/api/v1/permission', require('./api/permissions'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  app.get('/swagger', function(req,res){
    res.sendfile(app.get('appPath') + '/swagger');
  });

  app.get('/swagger.json', function(req,res){
    return res.sendfile(__dirname + '/swagger.json', 'swagger.json');
  });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.status(200).json({'node':'User!!!'});
    });
};
