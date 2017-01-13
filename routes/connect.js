var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('login');
  res.render
});

router.get('/login', function (req, res, next) {
  res.render('connect', { title: req.title, domain: req.currentDomain });
});


router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/home', // redirect to the secure profile section
  failureRedirect: '/', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));


router.get('/signup', function (req, res, next) {
  res.render('signup', { title: req.title, domain: req.currentDomain });
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/home', // redirect to the secure profile section
  failureRedirect: '/signup', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));

module.exports = router;