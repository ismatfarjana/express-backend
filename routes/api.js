const express = require('express');
const router = express.Router();
const { User } = require('./../models/user');
const jwt = require('jsonwebtoken');
const Parser = require('rss-parser');
const parser = new Parser();

// middleware
function authenticated(req, res, next) {
  const header = req.get('Authorization') ?? '';
  const noAuth = { err: 'Invalid Token', noAuth: true };

  if (header.toLowerCase().indexOf('bearer') === -1) {
    return res.status(401).send(noAuth);
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
      // err 
      // no user
      if (err || !user) return res.status(401).send(noAuth);

      // user
      req.readerUser = user;
      next();
    });
  });
}


router.get('/feeds', authenticated, (req, res) => {
  res.send({ feeds: req.readerUser.feeds });
});

router.post('/feeds', authenticated, (req, res) => {
  const { name, url } = req.body;
  const user = req.readerUser;

  if (!name || !url) {
    return res.status(422).send({
      err: 'Please supply name and url'
    });
  }

  user.feeds.push({
    name,
    url
  });

  user.save();

  res.send({ feeds: user.feeds });
});

router.delete('/feeds/:recordId', authenticated, (req, res) => {
  const user = req.readerUser;
  const { recordId } = req.params;

  const index = user.feeds.findIndex(record => record._id == recordId);

  if (index > -1) {
    user.feeds.splice(index, 1);
  }

  user.save();

  res.send({ feeds: user.feeds });
});

router.get('/feeds/:recordId', authenticated, (req, res) => {
  const user = req.readerUser;
  const { recordId } = req.params;

  const index = user.feeds.findIndex(record => record._id == recordId);

  if (index === -1) {
    return res.status(404).send({ err: 'Not found' });
  }

  const feed = user.feeds[index];

  parser.parseURL(feed.url).then(feed => {
    res.send(feed);
  });
});

module.exports = router;