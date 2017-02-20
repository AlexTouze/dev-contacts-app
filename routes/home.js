var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', isLoggedIn, function (req, res, next) {
  res.render('home', { title: req.title, domain: req.currentDomain, user: req.user, gregUrl: req.globalRegistryUrl});
});
/* GET home page. */
router.get('/call', isLoggedIn, function (req, res, next) {
  res.render('call', { title: req.title, domain: req.currentDomain, user: req.user, gregUrl: req.globalRegistryUrl});
});

/* GET current domain */
router.get('/getdomain', function (req, res, next) {
  var domain = req.currentDomain;
  res.json(domain);
});

router.get('/profile', isLoggedIn, function (req, res, next) {
  res.render('profile', { title: req.title, domain: req.currentDomain, user: req.user, gregUrl: req.globalRegistryUrl });
});

router.get('/admin', isLoggedIn, function (req, res, next) {
  res.render('admin', { title: req.title, domain: req.currentDomain, user: req.user, gregUrl: req.globalRegistryUrl });
});


// route middleware to make sure
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

module.exports = router;
