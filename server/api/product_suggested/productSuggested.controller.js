'use strict';


const Product = require('./ProductSuggested.model')

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

function findAndDelete(req, res) {
  if (!req.body.category) {
    Product.remove({ email: req.body.email }, function (err) {
      if (err) {
        return res.status(500).json({
          "message": err
        });
      }
    });
    return res.status(200).json({ result: true });
  }

  Product.find({ email: req.body.email, category: req.body.category }, function (err, products) {
    if (err) {
      return res.status(500).json({
        "message": err
      });
    }
    if (products.length === 1) {
      products[0].remove();
    } else {
      products.forEach(function (prod) {
        if (prod.product === req.body.product) {
          prod.remove()
        }
      });
    }
    res.status(200).json({ result: true });
  });
}

exports.save = save
exports.findByEmail = findByEmail
exports.findAndDelete = findAndDelete