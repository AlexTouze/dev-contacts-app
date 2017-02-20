var express = require('express');
var router = express.Router();
var passport = require('passport');


//router.get('/', function (req, res, next) {
//    res.render('index');
//});

router.get('/', isLoggedIn, function (req, res, next) {
  res.render('home', { title: req.title, domain: req.currentDomain, user: req.user, gregUrl: req.globalRegistryUrl });
});

// locally --------------------------------
router.get('/login', function (req, res, next) {
    res.render('connect', { message: req.flash('loginMessage') });
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/home', // redirect to the secure profile section
    failureRedirect: '/', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

router.get('/signup', function (req, res, next) {
    res.render('signup');
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

// connect jwt -----------------------------

router.get('/auth/connect', passport.authenticate('jwt', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true // allow flash messages
}));

router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

// route middleware to make sure
function isLoggedIn(req, res, next) {
    console.log(req.flash);

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.render('index');
}
module.exports = router;