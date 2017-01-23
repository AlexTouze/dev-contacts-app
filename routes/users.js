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


/**
 * Generates a public/private key pair from a given mnemonic (16 words).
 * Expects a string containing 16 words seperated by single spaces.
 * Retrieves data from the Global Registry.
 * @param  {string}     mnemonicAndSalt     A string of 16 words.
 * @returns  {Promise}  Promise          Global Registry Record.
 */
/*useGUID(mnemonicAndSalt) {
  // TODO: check if format is correct and if all words are from bip39 english wordlist
  var lastIndex = mnemonicAndSalt.lastIndexOf(' ');
  var mnemonic = mnemonicAndSalt.substring(0, lastIndex);
  var saltWord = mnemonicAndSalt.substring(lastIndex + 1, mnemonicAndSalt.length);
  this._createKeys(mnemonic, saltWord);

  var _this = this;

  // retrieve current info from Global Registry and fill this.globalRegistryRecord
  var msg = {
    type: 'READ',
    from: this._hypertyRuntimeURL + '/graph-connector',
    to: 'global://registry/',
    body: { guid: this.globalRegistryRecord.guid }
  };

  return new Promise(function(resolve, reject) {

    if (_this.messageBus === undefined) {
      reject('MessageBus not found on GraphConnector');
    } else {

      _this.messageBus.postMessage(msg, (reply) => {

        // reply should be the JSON returned from the Global Registry REST-interface
        var jwt = reply.body.data;
        var unwrappedJWT = KJUR.jws.JWS.parse(reply.body.data);
        var dataEncoded = unwrappedJWT.payloadObj.data;
        var dataDecoded = base64url.decode(dataEncoded);
        var dataJSON = JSON.parse(dataDecoded);

        // public key should match
        var sameKey = (dataJSON.publicKey == _this.globalRegistryRecord.publicKey);
        if (!sameKey) {
          reject('Retrieved key does not match!');
        } else {
          var publicKeyObject = jsrsasign.KEYUTIL.getKey(dataJSON.publicKey);
          var encodedString = jwt.split('.').slice(0, 2).join('.');
          var sigValueHex = unwrappedJWT.sigHex;
          var sig = new KJUR.crypto.Signature({alg: 'SHA256withECDSA'});
          sig.init(publicKeyObject);
          sig.updateString(encodedString);
          var isValid = sig.verify(sigValueHex);

          if (!isValid) {
            reject('Retrieved Record not valid!');
          } else {
            if (typeof dataJSON.userIDs != 'undefined' && dataJSON.userIDs != null) {
              _this.globalRegistryRecord.userIDs = dataJSON.userIDs;
            }
            _this.globalRegistryRecord.lastUpdate = dataJSON.lastUpdate;
            _this.globalRegistryRecord.timeout = dataJSON.timeout;
            _this.globalRegistryRecord.salt = dataJSON.salt;
            _this.globalRegistryRecord.active = dataJSON.active;
            _this.globalRegistryRecord.revoked = dataJSON.revoked;
            resolve(_this.globalRegistryRecord);
          }
        }
      });
    }
  });
}*/


module.exports = router;
