var express = require('express');
var router = express.Router();
var debug = require('debug')('users');
var request = require('request');
var jwt = require('jsonwebtoken');
var base64url = require('base64url');
var fs = require('fs');
var jws = require('jws');

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
  console.log("soure", source);
  var playload = btoa(currentUser.sPayload)*/
  var currentUser = req.body;
  var header = {
    "alg": "ES256",
    "typ": "JWT"
  }

  jwt.sign(currentUser.sPayload, currentUser.privateKey, { algorithm: 'ES256', header: { "alg": "ES256", "typ": "JWT" } }, function (err, token) {
    console.log(err);
    var rToken = token;
    jwt.verify(rToken, currentUser.publickey, {algorithms: ['ES256']}, function(err, decoded) {
      console.log(decoded) // bar
      console.log(err)
    });
    var decoded = jwt.decode(rToken, { complete: true });
    console.log(decoded.header);
    console.log(decoded.payload)
    console.log(decoded.signature);
    var urlRequest =  req.body.url + req.body.path;
    console.log(urlRequest);
    request(
      {
        method: 'PUT',
        uri: urlRequest,
        port: '5002',
        data: rToken
      },
      function (error, response, body) {
        if (response.statusCode != 200) {
          console.log('error ' + response.statusCode)
          console.log(JSON.stringify(req.body.token))
        } else {
          console.log('statusCode: ' + response.statusCode)
          console.log(JSON.stringify(req.body.token))
        }
      }
    )

  });

  /*var signature = jws.sign({
    header: { alg: 'ES256' },
    payload: playload,
    secret: currentUser.privateKey,
  });


  jwt.sign({
    data: playload
  }, 'secret', { expiresIn: 60 * 60, algorithm: 'ES256' }, function (err, token) {
    console.log(err);
    console.log(token);
  });*/


  /*jwt.sign({
    data: currentUser.sPayload
  }, currentUser.privateKey, { expiresIn: 60 * 60, algorithm: 'ES256', header: currentUser.sHeader }, function (err, token) {
    console.log(token);
    console.log(err);
  });*/
  /*   var b = jwt.sign({
    data: currentUser.sPayload
  }, currentUser.privateKey, { expiresIn: 60 * 60, algorithm: 'RS256', header: currentUser.sHeader }, function (err, token) {
    console.log(token);
    console.log(err);
  });
 });*/




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
