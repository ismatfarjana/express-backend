const express = require('express');
const router = express.Router();
const { User } = require('./../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

router.post('/login', (req, res) => {
  const { email, password } = req.body
  console.log(req.body)
  if (!email || !password) {
    return res.status(422).send({
      err: 'Please supply email and password'
    })
  }

  // To find one user 3 things can happen, 
  // we can get an err
  // or we can find the user
  // or we can not find the user
  User.findOne({ email }, (err, user) => {
    if (err) return res.status(404).send({ err: "Something went wrong" });
    if (!user) return res.status(401).send({ err: "the user name and/or password is incorrect!" })

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(400).send(err);
      if (!result) {
        return res.status(401).send({ err: "The username and/or password is incorrect!" });
      }
      let token = jwt.sign(
        { id: user._id },
        process.env.SECRET,
        { expiresIn: 86400 }
      )
      res.send({ token })
    })
  })

})

router.post('/register', (req, res) => {
  const { email, password } = req.body
  console.log(req.body)
  if (!email || !password) {
    return res.status(422).send({
      err: 'Please supply email and password'
    })
  }

  bcrypt.hash(password, 8, (err, hash) => {
    User.create({
      email,
      password: hash
    }, (err, user) => {
      if (err) return res.status(400).send(err);

      let token = jwt.sign(
        { id: user._id },
        process.env.SECRET,
        { expiresIn: 86400 }
      )

      res.send({ token })
    })
  })

})

module.exports = router;