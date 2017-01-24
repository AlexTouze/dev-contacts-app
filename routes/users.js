var express = require('express');
var router = express.Router();
var debug = require('debug')('users');
var request = require('request');
var jwt = require('jsonwebtoken');
var base64url = require('base64url');
var btoa = require("btoa");
var fs = require('fs');
var jws = require('jws');
var jwcrypto = require("browserid-crypto");
var sjcl = require("sjcl");
var bip39 = require('bip39');
require("browserid-crypto/lib/algs/ds");
jwcrypto.addEntropy('entropy');
var User = require('../models/userApp');

//https://scotch.io/tutorials/easy-node-authentication-google
/*
 * GET userlist.
 */
router.get('/getcontactlists', function (req, res, next) {
  User.find({}, function (err, users) {
    var userMap = {};

    users.forEach(function (user) {
      userMap[user._id] = user;
    });

    res.json(userMap);
  });
});

/*
 * POST to adduser.
 */
router.post('/addcontact', function (req, res, next) {
  var db = req.db;
  var newUser = new User();
  newUser.contactlist.mail = req.body.mail;
  newUser.contactlist.password = req.body.password;
  newUser.contactlist.firstname = req.body.firstname;
  newUser.contactlist.lastname = req.body.lastname;
  newUser.contactlist.age = req.body.age;
  newUser.contactlist.guid = req.body.guid;
  // save the user

  newUser.save(function (err) {
    if(err === null){

    }
    else {
      res.send({ msg: err });
    }
    res.send((err === null) ? { msg: '' } : { msg: err });
  });

});

/*
 * DELETE to deleteuser.
 */
router.delete('/removecontact/:id', function (req, res) {
  var userToDelete = req.params.id;
  User.findByIdAndRemove(userToDelete, function (err) {
    res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
  });
});


router.put('/addcontact', function (req, res, next) {

  //request.defaults({ 'proxy': 'http://proxy.rd.francetelecom.fr:3128/' })
  var token = req.body.token;
  var urlRequest = req.body.urlRequest;
  /*var token = signGlobalRegistryRecord(record);*/
  console.log(token);
  //var a = new GraphConnector();

  request(
    {
      method: 'PUT',
      uri: urlRequest,
      port: '5002',
      headers: {
        'Content-Length': token.length,
        'Content-Type': 'application/json'
      },
      body: token
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



//get a string to be used as a salt
function generateSalt() {
  var saltWord = bip39.generateMnemonic(8);
  var saltHashedBitArray = sjcl.hash.sha256.hash(saltWord);
  var salt = sjcl.codec.base64.fromBits(saltHashedBitArray);
  return salt;
}

// generate GUID
function generateGUID(publicPEM, salt) {
  var iterations = 10000;
  var guidBitArray = sjcl.misc.pbkdf2(publicPEM, salt, iterations);
  var guid = sjcl.codec.base64url.fromBits(guidBitArray);

  return guid;
}


function addToGlobalRegistry(token, graphConnector) {

  graphConnector.signGlobalRegistryRecord();
  console.log("userGUID", userGUID);
  var test = JSON.stringify({ data: dataJSONUser });
  var oHeader = { alg: 'ES256', typ: 'JWT' };
  var sHeader = JSON.stringify(oHeader);
  var base64Data = btoa(JSON.stringify(dataJSONUser));
  var sPayload = JSON.stringify({
    "data": base64Data
  });

  var sJWT = KJUR.jws.JWS.sign("ES256", sHeader, sPayload, userGUID.privatePEM);
  //console.log(sPayload);
  var path = '/guid/' + userGUID.guid;
  var dataUser = { url: urlOrange, port: port, path, sHeader: sHeader, sPayload: test, privateKey: userGUID.privatePEM, publickey: userGUID.publicPEM, expire: timeout, token: sJWT };
  var urlRequest = urlOrange + '/guid/' + currentGraphConnector.globalRegistryRecord.guid;

  $.ajax({
    type: 'PUT',
    url: '/users/addcontact/',
    data: { token: token, urlRequest: urlRequest }
  }).done(function (response) {
    console.log(response)
  })

}

function z () {
  var currentGraphConnector = getGraphConnector();
  currentGraphConnector.generateGUID();
  currentGraphConnector.globalRegistryRecord.userIDs.push({ uid: "user://machin.goendoer.net/", domain: "google.com" }, { uid: "user://bidule.com/fluffy123", domain: "google.com" });
  currentGraphConnector.globalRegistryRecord.defaults.push({ voice: "a", chat: "b", video: "c" })
  var token = currentGraphConnector.signGlobalRegistryRecord();
}

module.exports = router;
