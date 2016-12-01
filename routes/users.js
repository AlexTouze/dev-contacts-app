var express = require('express');
var router = express.Router();
var debug = require('debug')('users');
var request = require('request');
var fs = require('fs');

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
  /*var source = fs.createWriteStream(req.body.jwt);
  console.log("soure", source);*/
  request(
    {
      method: 'PUT',
      proxy: 'http://proxy.rd.francetelecom.fr:3128/',
      uri: req.body.url + req.body.path,
      port: '5002',
      headers: {
        'Content-Length': req.body.jwt.length,
        'Content-Type': 'application/text'
      },
      json: JSON.stringify(req.body.jwt) 
    },
    function (error, response, body) {
      if (response.statusCode != 200) {
        console.log('error'+ response.statusCode)
        console.log(req.body.jwt)
      } else {
        console.log('statusCode: ' + response.statusCode)
        console.log(req.body.jwt)
      }
    }
  )


  /*request(
    {
      proxy: 'http://proxy.rd.francetelecom.fr:3128/',
      url: req.body.url,
      port: '5002',
      method: 'GET'
    },
    function (error, response, body) {
      if (response.statusCode != 200) {
        console.log('document saved as: http://proxy.rd.francetelecom.fr:3128/')
      } else {
        console.log('response: ' + JSON.stringify(body))
      }
    }
  )*/

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
