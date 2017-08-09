'use strict';


const Product = require('./productSuggested.model')

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

function save(req, res) {
  Product.findOneAndUpdate(req.body, {}, { new: true, upsert: true }, function (err, products) {
    if (err) {
      return res.status(500).json({
        "message": err
      });
    }
    res.status(200).json({ products: products });
  });
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
  Product.findOneAndRemove(req.body, { passRawResult: true }, function (err, result) {
    if (result) return res.status(200).json(result);
    delete req.body.paymentPlan
    Product.findOneAndRemove(req.body, { passRawResult: true }, function (err1, result1) {
      if (result1) return res.status(200).json(result1);
      delete req.body.product
      Product.findOneAndRemove(req.body, { passRawResult: true }, function (err2, result2) {
        if (result2) return res.status(200).json(result2);
        res.status(200).json({});
      })
    })
  })

}

exports.save = save
exports.findByEmail = findByEmail
exports.findAndDelete = findAndDelete