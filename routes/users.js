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
var bitcoin = require('bitcoinjs-lib');
var jrs = require('jsrsasign');
var hex64 = require('hex64');
require("browserid-crypto/lib/algs/ds");
jwcrypto.addEntropy('entropy');
var User = require('../models/userApp');

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

  var currentUser = req.body;
  initRecord();

  var newUser = new User();
  newUser.contactlist.mail = currentUser.mail;
  newUser.contactlist.password = currentUser.password;
  newUser.contactlist.firstname = currentUser.firstname;
  newUser.contactlist.lastname = currentUser.lastname;
  newUser.contactlist.age = currentUser.age;
  newUser.contactlist.guid = _globalRegistryRecord.guid;
  // save the user

  newUser.save(function (err) {
    if (err) {
      res.send({ msg: err });
    }
    else {
      _globalRegistryRecord.userIDs.push({ uid: "user://machin.goendoer.net/", domain: "google.com" }, { uid: "user://bidule.com/fluffy123", domain: "google.com" });
      _globalRegistryRecord.defaults.push({ voice: "a", chat: "b", video: "c" })
      var jwt = _signGlobalRegistryRecord();
      var urlRequest = req.globalRegistryUrl + '/guid/' + _globalRegistryRecord.guid;
      var portRequest = req.globalRegistryPort;

      request({
        proxy: 'http://proxy.rd.francetelecom.fr:3128/',
        method: 'PUT',
        uri: urlRequest,
        port: portRequest,
        headers: {
          'Content-Length': jwt.length,
          'Content-Type': 'application/json'
        },
        body: jwt
      }, function (error, response, body) {
        if (response.statusCode != 200) {
          console.log(response.statusCode);
          res.send({ msg: error });
        } else {
          console.log(JSON.stringify(response));
          res.send({ msg: '' });
        }
      });
    }
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

function addToGR(jwt, callback) {

}

/********** JWT ********* */
var _globalRegistryRecord;
var privateKey;
var _prvKey;

var Record = function () {
  this.guid = "";
  this.salt = "";
  this.userIDs = [];
  this.lastUpdate = "";
  this.timeout = "";
  this.publicKey = "";
  this.active = "";
  this.revoked = "";
  this.schemaVersion = "1";
  this.defaults = [];
}

function initRecord() {
  _globalRegistryRecord = new Record();
  _generateGUID();
}

function _generateGUID() {

  // generate mnemonic and salt
  //Buffer.TYPED_ARRAY_SUPPORT = true;
  var mnemonic = bip39.generateMnemonic(160);

  var saltWord = bip39.generateMnemonic(8);
  _createKeys(mnemonic, saltWord);

  // set lasUpdate date
  _globalRegistryRecord.lastUpdate = new Date().toISOString();

  // set defualt timeout
  var timeout = new Date();
  timeout.setMonth(timeout.getMonth() + 120);
  _globalRegistryRecord.timeout = timeout.toISOString();

  // set default values
  _globalRegistryRecord.active = 1;
  _globalRegistryRecord.revoked = 0;

  // return mnemonic
  var rtn = mnemonic + ' ' + saltWord;
  return rtn;
}

function _createKeys(mnemonic, saltWord) {

  // generate key pair
  var seed = bip39.mnemonicToSeed(mnemonic);
  //Buffer.TYPED_ARRAY_SUPPORT = false;
  var hdnode = bitcoin.HDNode.fromSeedBuffer(seed);
  var ecparams = jrs.KJUR.crypto.ECParameterDB.getByName('secp256k1');
  var biPrv = hdnode.keyPair.d; // private key big integer
  var epPub = ecparams.G.multiply(biPrv); // d*G
  var biX = epPub.getX().toBigInteger(); // x from Q
  var biY = epPub.getY().toBigInteger(); // y from Q
  var charlen = ecparams.keylen / 4;
  var hPrv = ('0000000000' + biPrv.toString(16)).slice(-charlen);
  var hX = ('0000000000' + biX.toString(16)).slice(-charlen);
  var hY = ('0000000000' + biY.toString(16)).slice(-charlen);
  var hPub = '04' + hX + hY;
  _prvKey = new jrs.KJUR.crypto.ECDSA({ curve: 'secp256k1' });
  _prvKey.setPrivateKeyHex(hPrv);
  _prvKey.isPrivate = true;
  _prvKey.isPublic = false;
  var pubKey = new jrs.KJUR.crypto.ECDSA({ curve: 'secp256k1' });
  privateKey = jrs.KEYUTIL.getPEM(_prvKey, 'PKCS8PRV');
  pubKey.setPublicKeyHex(hPub);
  pubKey.isPrivate = false;
  pubKey.isPublic = true;
  var publicKey = jrs.KEYUTIL.getPEM(pubKey, 'PKCS8PUB');
  publicKey = publicKey.replace(/(\r\n|\n|\r)/gm, '');
  _globalRegistryRecord.publicKey = publicKey;

  // generate salt
  var saltHashedBitArray = sjcl.hash.sha256.hash(saltWord);
  var salt = sjcl.codec.base64.fromBits(saltHashedBitArray);
  _globalRegistryRecord.salt = salt;

  // generate GUID
  var iterations = 10000;
  var guidBitArray = sjcl.misc.pbkdf2(_globalRegistryRecord.publicKey, salt, iterations);
  var guid = sjcl.codec.base64url.fromBits(guidBitArray);
  _globalRegistryRecord.guid = guid;
}


function _signGlobalRegistryRecord() {

  var recordString = JSON.stringify(_globalRegistryRecord);
  var recordStringBase64 = base64url.encode(recordString);

  var jwtTemp = jrs.KJUR.jws.JWS.sign(null, { alg: 'ES256' }, { data: recordStringBase64 }, _prvKey);
  var encodedString = jwtTemp.split('.').slice(0, 2).join('.');

  var sig = new jrs.KJUR.crypto.Signature({ alg: 'SHA256withECDSA' });
  sig.init(privateKey);
  sig.updateString(encodedString);

  var signatureHex = sig.sign();
  var signature = hex64.toBase64(signatureHex);
  var jwt = encodedString + '.' + signature;
  return jwt;
}

module.exports = router;
