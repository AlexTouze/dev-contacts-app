var express = require('express');
var router = express.Router();
var debug = require('debug')('users');
var request = require('request');

/*
 * GET userlist.
 */
router.get('/getcontactlists', function (req, res, next) {
  var db = req.db;
  var collection = db.get('contactlist');
  collection.find({}, {}, function (e, docs) {
    res.json(docs);
  });
});

/*
 * POST to adduser.
 */
router.post('/addcontact', function (req, res, next) {
  var db = req.db;
  db.collection('contactlist').insert(req.body, function (err, result) {
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    );
  });
});

router.put('/addcontact', function (req, res, next) {
  //request.defaults({ 'proxy': 'http://proxy.rd.francetelecom.fr:3128/' })
  var options = {
    proxy: 'http://proxy.rd.francetelecom.fr:3128/',
    url: req.body.url + req.body.path,
    port: '5002',
    method: 'PUT',
    headers: {
      'Content-Length': req.body.jwt.length,
      'Content-Type': 'application/text'
    }
  };
  function callback(error, response, body) {
    console.log('response', response.statusCode);
    res.send((error === null) ? { msg: response.statusCode } : { msg: 'error: ' + error });
  }

  request(options, callback);

});

/*
 * DELETE to deleteuser.
 */
router.delete('/removecontact/:id', function (req, res) {
  var db = req.db;
  var collection = db.get('contactlist');
  var userToDelete = req.params.id;
  collection.remove({ '_id': userToDelete }, function (err) {
    res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
  });
});




module.exports = router;
