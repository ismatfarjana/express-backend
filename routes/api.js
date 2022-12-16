const express = require('express');
const router = express.Router();
const { User } = require('./../models/user');
const jwt = require('jsonwebtoken')

// middleware
function authenticated(req, res, next) {
  const header = req.get('Authorization') ?? '';
  const noAuth = { err: 'Invalid Token', noAuth: true }

  if (header.toLowercase().indexOf('bearer') === -1) {
    return res.status(401).send(noAuth)
  }

  const token = header.split(' ')[1];

  if (!token) {
    return res.status(401).send(noAuth);
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    // error
    if (err) return res.status(401).send(noAuth);

    // valid token
    User.findById(decoded.id, (err, user) => {
      // err // no user
      if (err || !user) return res.status(401).send(noAuth);

      // user
      req.readerUser = user;
      next();
    })
  })
}