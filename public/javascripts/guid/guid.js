var privatePEM;
var publicPEM;
var salt;

// generate a ECDSA key pair over curve secp256k1
function generateECDSA() {

    // generate key pair with bitcoinjs-lib
    var mnemonic = bip39.generateMnemonic(160);
    var seed = bip39.mnemonicToSeed(mnemonic);
    var hdnode = bitcoin.HDNode.fromSeedBuffer(seed);

    // public key: generate an uncompressed key with Q = d*G
    var ecparams = KJUR.crypto.ECParameterDB.getByName('secp256k1');
    var biPrv = hdnode.keyPair.d; // private key big integer
    var epPub = ecparams['G'].multiply(biPrv); // d*G
    var biX = epPub.getX().toBigInteger(); // x from Q
    var biY = epPub.getY().toBigInteger(); // y from Q

    // generate hex values for private and public key
    var charlen = ecparams['keylen'] / 4;
    var hPrv = ('0000000000' + biPrv.toString(16)).slice(- charlen);
    var hX = ('0000000000' + biX.toString(16)).slice(- charlen);
    var hY = ('0000000000' + biY.toString(16)).slice(- charlen);
    var hPub = '04' + hX + hY;

    // generate key pair objects
    var prvKey = new KJUR.crypto.ECDSA({ 'curve': 'secp256k1' });
    prvKey.setPrivateKeyHex(hPrv);
    prvKey.isPrivate = true;
    prvKey.isPublic = false;
    var pubKey = new KJUR.crypto.ECDSA({ 'curve': 'secp256k1' });
    pubKey.setPublicKeyHex(hPub);
    pubKey.isPrivate = false;
    pubKey.isPublic = true;
    publicPEM = KEYUTIL.getPEM(pubKey, 'PKCS8PUB');
    publicPEM = publicPEM.replace(/(\r\n|\n|\r)/gm, ""); // removing line breaks
    privatePEM = KEYUTIL.getPEM(prvKey, 'PKCS8PRV');
    
    /*var ec = new KJUR.crypto.ECDSA({'curve': 'secp256k1'});
    publicPEM = KEYUTIL.getPEM(ec, 'PKCS8PUB');
    publicPEM = publicPEM.replace(/(\r\n|\n|\r)/gm, ""); // removing line breaks
    privatePEM = KEYUTIL.getPEM(ec, 'PKCS8PRV');
    /*var keypair = ec.generateKeyPairHex();
    var pubKey;
    var prvKey; 
    pubKey = prvKey = ec;
    pubKey.setPrivateKeyHex(null);
    pubKey.isPrivate = false;
    pubKey.isPublic = true;
    prvKey.setPublicKeyHex(null);
    prvKey.isPrivate = true;
    prvKey.isPublic = false;
    var pubhex = keypair.ecpubhex; // hexadecimal string of EC public key
    var prvhex = keypair.ecprvhex; */

    //privatePEM = privatePEM.replace(/(\r\n|\n|\r)/gm, "");// removing line breaks

    //var ec = new KJUR.crypto.ECDSA({'curve': 'secp256k1'});
  
}

//get a string to be used as a salt
function generateSalt() {
    var saltWord = bip39.generateMnemonic(8);
    var saltHashedBitArray = sjcl.hash.sha256.hash(saltWord);
    salt = sjcl.codec.base64.fromBits(saltHashedBitArray);
}


// generate GUID
function generateGUID() {

    if (!publicPEM || 0 === publicPEM.length)  generateECDSA();

    if (!salt || 0 === salt.length) generateSalt();

    var iterations = 10000;
    var guidBitArray = sjcl.misc.pbkdf2(publicPEM, salt, iterations);
    var guid = sjcl.codec.base64url.fromBits(guidBitArray);

    return { guid: guid, publicPEM: publicPEM, privatePEM: privatePEM, salt: salt };
}