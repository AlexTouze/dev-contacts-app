var express = require('express');
var router = express.Router();
var debug = require('debug')('users');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.post('/adduser', function (req, res, next) {
  var db = req.db;
  
  debug("User -->", req.body);

  db.collection('restaurants').insert(req.body, function (err, result) {
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    );
  });
});



module.exports = router;
