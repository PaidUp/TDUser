'use strict';


const Permission = require('./permissions.model')

function findByRole(req, res) {
  let roles = req.query.roles ? req.query.roles.split(",") : [];

  Permission.find({ "roles" : {$in : roles} }, function (err, permissions) {
    if (err) {
      return res.status(500).json({
        "message": err
      });
    }
    
    res.status(200).json({ permissions: permissions });
  });
}

exports.findByRole = findByRole
