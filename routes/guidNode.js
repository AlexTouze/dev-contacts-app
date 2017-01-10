var express = require('express');
var router = express.Router();
var keypair = require('keypair');

/*
 * GET userlist.
 */
router.get('/getGUID', function (req, res, next) {
    var rs = require('jsrsasign');
    var kp = rs.KEYUTIL.generateKeypair("EC", "secp256k1");
    var privatePEM = rs.KEYUTIL.getPEM(kp.prvKeyObj, "PKCS8PRV");
    var publicPEM = rs.KEYUTIL.getPEM(kp.pubKeyObj, "PKCS8PUB");
    res.send({ private: privatePEM, public: publicPEM });
});


module.exports = router;
