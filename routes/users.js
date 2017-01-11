var express = require('express');
var router = express.Router();
var debug = require('debug')('users');
var request = require('request');
var jwt = require('jsonwebtoken');
var base64url = require('base64url');
var fs = require('fs');
var jws = require('jws');
var jwcrypto = require("browserid-crypto");
require("browserid-crypto/lib/algs/ds");
jwcrypto.addEntropy('entropy');
var sjcl = require('sjcl');

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
  
  /*var source = fs.createWriteStream(req.body.jwt);
  console.log("soure", source);
  var playload = btoa(currentUser.sPayload)*/
  //request.defaults({ 'proxy': 'http://proxy.rd.francetelecom.fr:3128/' })
  var currentUser = req.body;
  var header = {
    "alg": "ES256",
    "typ": "JWT"
  }

  jwt.sign(currentUser.sPayload, currentUser.privateKey, { algorithm: 'ES256', header: { "alg": "ES256", "typ": "JWT" } }, function (err, token) {
    console.log(err);
    var rToken = token;
    /*jwt.verify(rToken, currentUser.publickey, {algorithms: ['ES256']}, function(err, decoded) {
      console.log(decoded) // bar
      console.log(err)
    });*/
    /*var decoded = jwt.decode(rToken, { complete: true });
    console.log("header -->", decoded.header);
    console.log("payload -->", decoded.payload)
    console.log("signature -->",decoded.signature);*/
    var urlRequest =  req.body.url + req.body.path;
    console.log(urlRequest);
    console.log(currentUser.token);
    console.log(currentUser.token.length);
    //request.defaults({ 'proxy': 'http://proxy.rd.francetelecom.fr:3128/' })
    request(
      {
        proxy: 'http://proxy.rd.francetelecom.fr:3128/',
        method: 'PUT',
        uri: urlRequest,
        port: '5002',
        headers: {
            'Content-Length': currentUser.token.length,
            'Content-Type': 'application/json'
        },
        body : currentUser.token
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

router.put('/addcontactNodeJWT', function (req, res, next) {

  var currentUser = req.body;

  jwcrypto.generateKeypair({
    algorithm: 'DSA',
    keysize: 160
  }, function(err, keypair) {
      // error in err?

      // serialize the public key
      console.log(keypair.publicKey.serialize());

      // just the JSON object to embed in another structure
      console.log(JSON.stringify({stuff: keypair.publicKey.toSimpleObject()}));

      // replace this with the key to sign
      var publicKeyToCertify = keypair.publicKey.serialize();

      // create and sign a JWS
      var payload = {principal: {email: 'some@dude.domain'},
                    pubkey: jwcrypto.loadPublicKey(publicKeyToCertify)};

      jwcrypto.sign(payload, keypair.secretKey, function(err, jws) {
          // error in err?

          // serialize it
          console.log(jws.toString());

          // replace with things to verify
          var signedObject = jws;
          var publicKey = keypair.publicKey;

          // verify it
          jwcrypto.verify(signedObject, publicKey, function(err, payload) {
            // if verification fails, then err tells you why
            // if verification succeeds, err is null, and payload is
            // the signed JS object.
          });
      });

      // replace this with the key to load
      var storedSecretKey = keypair.secretKey.serialize();

      // also, if loading a secret key from somewhere
      var otherSecretKey = jwcrypto.loadSecretKey(storedSecretKey);

      
  });

})

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
