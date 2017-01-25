var express = require('express');
var router = express.Router();
var passport = require('passport');


router.get('/', function (req, res, next) {
    res.render('login');
});

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
    successRedirect: 'users/adduser', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));


module.exports = router;