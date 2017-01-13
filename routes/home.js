var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: req.title , domain: req.currentDomain });
});

/* GET current domain */
router.get('/getdomain', function(req, res, next) {
  var domain = req.currentDomain;
  res.json(domain);
});

module.exports = router;
