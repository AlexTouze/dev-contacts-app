var express = require('express');
var router = express.Router();
var request = require('request');
var jwt = require('jsonwebtoken');
var base64url = require('base64url');
var btoa = require("btoa");
var jws = require('jws');
var sjcl = require("sjcl");
var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');
var jrs = require('jsrsasign');
var hex64 = require('hex64');
var UserApp = require('../models/userApp');
var UserLocal = require('../models/userLocal');

/*
 * GET userlist.
 */
router.get('/getcontactlists', function (req, res, next) {

  var loggedUser = req.user.local.guid;
  UserApp.find({"contactlist.associatedUser":loggedUser}, function (err, users) {
    var userMap = {};

    users.forEach(function (user) {
//      if (loggedUser === user.contactlist.associatedUser) {
        userMap[user._id] = user;
//      }
    });
    res.json(userMap);
  });
});

router.get('/getLocalUsers', function (req, res, next) {
  UserLocal.find({}, function (err, users) {
    var userMap = {};

    users.forEach(function (user) {
      userMap[user._id] = user;
    });

    res.json(userMap);
  });
});

/*
 * DELETE to deleteuser.
 */
router.delete('/removeLocalUsers/:id', function (req, res) {
  var loggedUser = req.user;
  var userToDelete = req.params.id;
  if (loggedUser._id != userToDelete) {
    UserLocal.findByIdAndRemove(userToDelete, function (err) {
      res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
    });
  }
  else {
    res.send({ msg: 'error: you can not delete your current profile' });
  }
});

/*
 * POST to adduser.
 */
router.post('/addcontact', function (req, res, next) {
  var currentUser = req.body;

  var newUser = new UserApp();
//  newUser.contactlist.mail = currentUser.mail;
  newUser.contactlist.firstname = currentUser.firstname;
  newUser.contactlist.lastname = currentUser.lastname;
  newUser.contactlist.info = currentUser.information;
//  newUser.contactlist.age = currentUser.age;
  newUser.contactlist.guid = currentUser.guid;
  newUser.contactlist.associatedUser = req.user.local.guid;

  if (currentUser.guid != "") {
    var urlRequest = req.globalRegistryUrl + '/guid/' + currentUser.guid;
    request(
      {
        method: 'GET',
        proxy: req.proxy,
        uri: urlRequest,
      },
      function (error, response, body) {
        if (response.statusCode != 200) {
          console.log('error ' + response.statusCode);
          console.log(JSON.stringify(req.body));
          newUser.save(function (err) {
            if (err) {
              res.send({ msg: err });
            }
            else {
              res.send({ msg: '' });
            }
          });
        } else {
          var dht = response.body;
          var record = JSON.parse(base64url.decode(JSON.parse(base64url.decode((JSON.parse(dht).Value).split(".")[1])).data));

          newUser.contactlist.uids = JSON.stringify(buildUidArray(record));
          newUser.save(function (err) {
            if (err) {
              res.send({ msg: err });
            }
            else {
              res.send({ msg: '' });
            }
          });
        }
      }
    )
  }
  else {
    newUser.save(function (err) {
      if (err) {
        res.send({ msg: err });
      }
      else {
        res.send({ msg: '' });
      }
    });
  }
});


/*
 * POST to adduser.
 */
router.post('/updatecontact/:id', function (req, res, next) {
  var contactGUID = req.params.id;
  UserApp.findOne({"contactlist.guid":contactGUID, "contactlist.associatedUser":req.user.local.guid}, function (err, currentUser) {
 //   users.forEach(function (currentUser) {
      if (currentUser.contactlist.guid != "") {
        var urlRequest = req.globalRegistryUrl + '/guid/' + currentUser.contactlist.guid;
        request(
          {
            method: 'GET',
            proxy: req.proxy,
            uri: urlRequest,
          },
          function (error, response, body) {
            if (response.statusCode != 200) {
              console.log('error ' + response.statusCode);
              console.log(JSON.stringify(req.body));
              currentUser.save(function (err) {
                if (err) {
                  res.send({ msg: err });
                }
                else {
                  res.send({ msg: '' });
                }
              });
            } else {
              var dht = response.body;
              var record = JSON.parse(base64url.decode(JSON.parse(base64url.decode((JSON.parse(dht).Value).split(".")[1])).data));
              currentUser.contactlist.uids = JSON.stringify(buildUidArray(record));              
              currentUser.save(function (err) {
                if (err) {
                  res.send({ msg: err });
                }
                else {
                  res.send({ msg: '' });
                }
              });
            }
          })
        }
    //});
  });
});

/*
 * DELETE to deleteuser.
 */
router.delete('/removecontact/:id', function (req, res) {
  var userToDelete = req.params.id;
  UserApp.findByIdAndRemove(userToDelete, function (err) {
    res.send((err === null) ? { msg: '' } : { msg: 'error: ' + err });
  });
});

router.get('/addDomain', function (req, res, next) {
  res.render('addDomain');
});


router.post('/addContactToGlobal', function (req, res, next) {
  var loggedUser = req.user.local.guid;
	console.log(req.user);
  if (loggedUser === '') {
    console.log("loggedUser",loggedUser );

    var currentUser = req.user;
    initRecord();
    var idpDomain = req.body.idpDomain;
    var userId = "user://" + normalizeDomain(idpDomain) + "/" + req.body.uid
    var serviceDomain = normalizeDomain(req.body.serviceDomain);
    _globalRegistryRecord.userIDs.push({ "uid": userId, "domain":  serviceDomain});
    _globalRegistryRecord.defaults = ({ "voice": "a", "chat": "b", "video": "c" })
    var jwt = _signGlobalRegistryRecord();
    var urlRequest = req.globalRegistryUrl + '/guid/' + _globalRegistryRecord.guid;

    request({
      proxy: req.proxy,
      method: 'PUT',
      uri: urlRequest,
      headers: {
        'Content-Length': jwt.length,
        'Content-Type': 'application/json'
      },
      body: jwt
    }, function (error, response, body) {
      if (response.statusCode != 200) {
        console.log(JSON.stringify(response));
        //res.send({ msg: error });
      } else {
        console.log(JSON.stringify(response));
        var guid = response.request.uri.path.replace('/guid/', '');
        delete currentUser._id;
        UserLocal.findById(req.user._id, function (err, user) {
          if (err) throw err;
          user.local.guid = guid;
          //user.local.prvKey = _prvKey;
          user.local.privateKey = privateKey;
          console.log(user);
          user.save(console.log);
          res.redirect('/home');
        });
      }
    });
  }
  else {
    updateGlobalRegistryRecord(loggedUser, req, res, next)
  }
});

router.post('/removeContactFromGlobal', function (req, res, next) {
  var loggedUser = req.user.local.guid;
  updateGlobalRegistryRemoveRecord(loggedUser, req, res, next);
});

/**
 * This is to register a new GUID
 */
router.put('/globalcontact/', function (req, res, next) {
  var guid = req.params.guid;
  var loggedUser = req.user.local.guid;
 initRecord();
  _globalRegistryRecord
  var currentUser = req.user;


    _globalRegistryRecord.legacyIDs.push({ "id": req.user.local.email, "category": req.currentDomain });
    _globalRegistryRecord.defaults = ({ "voice": "a", "chat": "b", "video": "c" })
    var jwt = _signGlobalRegistryRecord();
    var urlRequest = req.globalRegistryUrl  + '/guid/' + _globalRegistryRecord.guid;

    request({
      proxy: req.proxy,
      method: 'PUT',
      uri: urlRequest,
      headers: {
        'Content-Length': jwt.length,
        'Content-Type': 'application/json'
      },
      body: jwt
    }, function (error, response, body) {
      if (response.statusCode != 200) {
        console.log(JSON.stringify(response));
        res.send({ msg: error });
      } else {
        console.log(JSON.stringify(response));
        var guid = response.request.uri.path.replace('/guid/', '');
        delete currentUser._id;
        UserLocal.findById(req.user._id, function (err, user) {
          if (err) throw err;
          user.local.guid = guid;
          //user.local.prvKey = _prvKey;
          user.local.privateKey = privateKey;
          console.log(user);
          user.save(console.log);
          res.send({ msg: '' });
        });
      }
    });
});

/*
* This is to merge an account to an already existing GUID
*/
router.put('/globalcontact/:guid', function (req, res, next) {
  var currentUser = req.user;
  var guid = req.params.guid;
  // Verify if the GUID exists
  var urlRequest = req.globalRegistryUrl + '/guid/' + guid;
  request(
     {
        method: 'GET',
        proxy: req.proxy,
        uri: urlRequest,
     },
     function (error, response, body) {
        // GUID not found
        if (response.statusCode != 200) {
          console.log('error ' + response.statusCode);
          console.log(JSON.stringify(req.body));
          res.send({ msg: 'GUID Not found error ' + response.statusCode });
        } else {  
          // GUID Found, save it
          currentUser.local.guid = guid;
          currentUser.local.privateKey = req.body.key;
          currentUser.save(function (err) {
            if (err) {
              res.send({ msg: err });
            }
            else {
              res.send({ msg: '' });
            }
          });
        }
    });
});

/*
router.get('/getUserInfo', function (req, res, next) {
  var guid = req.user.local.guid;
  getGlobalContact(guid, req, res, next);
});
*/

router.get('/getRoom/:id', function (req, res, next) {
  var urlRequest = req.domainRegistryUrl + req.params.id;
  request(
    {
      method: 'GET',
      proxy: req.proxy,
      uri: urlRequest,
    },
    function (error, response, body) {

      if (response.statusCode != 200) {
        console.log('error ' + response.statusCode);
        console.log(JSON.stringify(req.body));
           res.json({ url: '' });
     }
      else {
        if (response.body != '{}') {
          var roomList = JSON.parse(response.body);
          var idRoom;

          for (var room in roomList) {
            idRoom = room;
          }
          res.json({ url: req.webRTCUrl + 'room/' + idRoom });
        }
        else {
          res.json({ url: '' });
        }

      }

    });
});

function buildUidArray(record)
{
      if (!record.legacyIDs)
      {
        record.legacyIDs = [];
      }
      if (!record.userIDs)
      {
        record.userIDs = [];
      }
      return record.userIDs.concat(record.legacyIDs);
}

/* TODO suppress this
function getGlobalContact(guid, req, res, next) {
  var urlRequest = req.globalRegistryUrl  + '/guid/' + guid;
  request(
    {
      method: 'GET',
      proxy: req.proxy,
      uri: urlRequest,
    },
    function (error, response, body) {
      if (response.statusCode != 200) {
        console.log('error ' + response.statusCode)
        console.log(JSON.stringify(req.body))
      } else {
        var dht = response.body;
        var result = base64url.decode(JSON.parse(base64url.decode((JSON.parse(dht).Value).split(".")[1])).data);
        var record = JSON.parse(result);
         res.send(buildUidArray(record));
      }
    }
  )
}
*/

function updateGlobalRegistryRecord(guid, req, res, next) {
  var urlRequest = req.globalRegistryUrl  + '/guid/' + guid;
  var isReTHINK = false;
  if (typeof req.body.reTHINKCheck != 'undefined' && req.body.reTHINKCheck == 'on')
  {
      isReTHINK = true;
  }
  request(
    {
      method: 'GET',
      proxy: req.proxy,
      uri: urlRequest,
    },
    function (error, response, body) {
      if (response.statusCode != 200) {
        console.log('error ' + response.statusCode)
        console.log(JSON.stringify(req.body))
      }
      else {
        var jwt = (JSON.parse(response.body).Value).split(".");
        var jwtHeader = jwt[0];
        var updateRecord = JSON.parse(base64url.decode(JSON.parse(base64url.decode(jwt[1])).data));

        var userId = req.body.uid;
        var idpDomain = req.body.idpDomain;
        var serviceDomain = normalizeDomain(req.body.serviceDomain);
        if (isReTHINK)
        {
          if (!updateRecord.userIDs)
          {
            updateRecord.userIDs = [];
          }
          userId = "user://" + normalizeDomain(idpDomain) + "/" + req.body.uid;
          updateRecord.userIDs.push({ "uid": userId, "domain": serviceDomain });
        }
        else {
          if (!updateRecord.legacyIDs)
          {
            updateRecord.legacyIDs = [];
          }
          updateRecord.legacyIDs.push({ "id": userId, "category": serviceDomain});
        }
  
          saveRecord(urlRequest, req, res, jwtHeader, updateRecord, req.user.local.privateKey);
      }
    }
  )

}


function updateGlobalRegistryRemoveRecord(guid, req, res, next) {
  var urlRequest = req.globalRegistryUrl  + '/guid/' + guid;
  request(
    {
      method: 'GET',
      proxy: req.proxy,
      uri: urlRequest,
    },
    function (error, response, body) {
      if (response.statusCode != 200) {
        console.log('error ' + response.statusCode)
        console.log(JSON.stringify(req.body))
      }
      else {
        var jwt = (JSON.parse(response.body).Value).split(".");
        var jwtHeader = jwt[0];
        var updateRecord = JSON.parse(base64url.decode(JSON.parse(base64url.decode(jwt[1])).data));

        var userId = req.body.id;
        var serviceDomain = req.body.domain;
        var removed = false;
        // look for 
        if (updateRecord.userIDs)
        {
          var arrayResult = updateRecord.userIDs.filter(function(item){
            return ((item.uid != userId) || (item.domain != serviceDomain));
          });
          removed = (arrayResult.length <  (updateRecord.userIDs.length));
          updateRecord.userIDs = arrayResult;
        }
        if (!removed) {
            if (updateRecord.legacyIDs)
            {
              var arrayResult2 = updateRecord.legacyIDs.filter(function(item){
                  return ((item.id != userId) || item.category != serviceDomain);
                });
                removed = (arrayResult2.length <  (updateRecord.legacyIDs.length));
                updateRecord.legacyIDs = arrayResult2;
            }
         }
         saveRecord(urlRequest, req,  res, jwtHeader, updateRecord, req.user.local.privateKey);
      }
    }
  )

}

function saveRecord(urlRequest, req, res, jwtHeader, updateRecord, privateKey)
{
      updateRecord.lastUpdate = new Date().toISOString();
      var signJWT = signUpdateRecord(jwtHeader, updateRecord, privateKey);
      console.log("------------");
      console.log(updateRecord);
      console.log("------------");
      request({
        proxy: req.proxy,
        method: 'PUT',
        uri: urlRequest,
        headers: {
          'Content-Length': signJWT.length,
          'Content-Type': 'application/json'
        },
        body: signJWT
      }, function (error, response, body) {
        if (response.statusCode != 200) {
          console.log(JSON.stringify(response));
          //res.send({ msg: error });
        } else {
          console.log(JSON.stringify(response));

          res.redirect('/home/profile');
        }
      });
}

function normalizeDomain(aDomain)
{
  // Strip scheme
  var index = aDomain.indexOf("://");
  var retValue = aDomain;
  if (index > -1)
  {
    retValue = aDomain.slice(index + 3);
  }
  index = retValue.indexOf("/");
  if (index > -1)
  {
    retValue = retValue.slice(0, index);
  }
  return retValue;
}

/********** JWT ********* */
var _globalRegistryRecord;
var privateKey;
var _prvKey;

var Record = function () {
  this.guid = "";
  this.salt = "";
  this.userIDs = [];
  this.legacyIDs = [];
  this.lastUpdate = "";
  this.timeout = "";
  this.publicKey = "";
  this.active = "";
  this.revoked = "";
  this.schemaVersion = "1";
  this.defaults = "";
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

function signUpdateRecord(jwtHeader, updateRecord, userPrivateKey) {
  var jwtTemp = base64url.encode(JSON.stringify({ "data": base64url.encode(JSON.stringify(updateRecord)) }));
  var encodedString = jwtHeader + '.' + jwtTemp;

  var sig = new jrs.KJUR.crypto.Signature({ alg: 'SHA256withECDSA' });
  sig.init(userPrivateKey);
  sig.updateString(encodedString);

  var signatureHex = sig.sign();
  var signature = hex64.toBase64(signatureHex);
  var jwt = encodedString + '.' + signature;
  return jwt;
}

module.exports = router;
