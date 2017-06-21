'use strict';


var Product = require('./ProductSuggested.model')

function save(req, res) {
  var prod = new Product(req.body)
  prod.save(function (err, data) {
    if (err) {
      return res.status(500).json({
        "message": err
      });
    }
    Product.find({ email: req.body.email }, function (err, products) {
      if (err) {
        return res.status(500).json({
          "message": err
        });
      }
      res.status(200).json({ products: products });
    });
  })
}

function findByEmail(req, res) {
  Product.find({ email: req.params.email }, function (err, products) {
    if (err) {
      return res.status(500).json({
        "message": err
      });
    }
    res.status(200).json({ products: products });
  });
}

exports.save = save
exports.findByEmail = findByEmail