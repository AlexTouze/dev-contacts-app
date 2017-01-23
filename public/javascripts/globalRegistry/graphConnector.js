var GraphConnector = function graphConnector() {
    this.contacts = [];
    this.lastCalculationBloomFilter1Hop = new Date(0).toISOString();
    //this._record = getRecord();
    this.globalRegistryRecord = getRecord();
    this._prvKey = "";
    this.privateKey = "";

    this.groups = [];
    this.residenceLocation = "";
    this.firstName = "";
    this.lastName = "";

    this._messageBus = "";
    this._hypertyRuntimeURL = "";
    this.generateGUID = generateGUID;
    this._createKeys = _createKeys;
    this.signGlobalRegistryRecord = signGlobalRegistryRecord;
    this.addUserID = addUserID;
    this.removeUserID = removeUserID;
    this.calculateBloomFilter1Hop = calculateBloomFilter1Hop;
    this.checkGUID = checkGUID;
    this.getContact = getContact;
    this.addContactGC = addContactGC; 
    this.removeContactGC = removeContactGC; 
}

function getGraphConnector() {
    return new GraphConnector();
}

function generateGUID() {

    // generate mnemonic and salt
    //Buffer.TYPED_ARRAY_SUPPORT = true;
    var mnemonic = bip39.generateMnemonic(160);

    var saltWord = bip39.generateMnemonic(8);
    this._createKeys(mnemonic, saltWord);

    // set lasUpdate date
    this.globalRegistryRecord.lastUpdate = new Date().toISOString();

    // set defualt timeout
    var timeout = new Date();
    timeout.setMonth(timeout.getMonth() + 120);
    this.globalRegistryRecord.timeout = timeout.toISOString();

    // set default values
    this.globalRegistryRecord.active = 1;
    this.globalRegistryRecord.revoked = 0;

    // return mnemonic
    var rtn = mnemonic + ' ' + saltWord;
    return rtn;
}

/**
 * Creates the keys from mnemonic and salt. Also sets public key, guid, and salt for globalRegistryRecord.
 * @param  {string}     mnemonic     A string with 15 words.
 * @param  {string}     salt         A word.
 */
function _createKeys(mnemonic, saltWord) {

    // generate key pair
    var seed = bip39.mnemonicToSeed(mnemonic);
    //Buffer.TYPED_ARRAY_SUPPORT = false;
    var hdnode = bitcoin.HDNode.fromSeedBuffer(seed);
    var ecparams = KJUR.crypto.ECParameterDB.getByName('secp256k1');
    var biPrv = hdnode.keyPair.d; // private key big integer
    var epPub = ecparams.G.multiply(biPrv); // d*G
    var biX = epPub.getX().toBigInteger(); // x from Q
    var biY = epPub.getY().toBigInteger(); // y from Q
    var charlen = ecparams.keylen / 4;
    var hPrv = ('0000000000' + biPrv.toString(16)).slice(-charlen);
    var hX = ('0000000000' + biX.toString(16)).slice(-charlen);
    var hY = ('0000000000' + biY.toString(16)).slice(-charlen);
    var hPub = '04' + hX + hY;
    this._prvKey = new KJUR.crypto.ECDSA({ curve: 'secp256k1' });
    this._prvKey.setPrivateKeyHex(hPrv);
    this._prvKey.isPrivate = true;
    this._prvKey.isPublic = false;
    var pubKey = new KJUR.crypto.ECDSA({ curve: 'secp256k1' });
    this.privateKey = KEYUTIL.getPEM(this._prvKey, 'PKCS8PRV');
    pubKey.setPublicKeyHex(hPub);
    pubKey.isPrivate = false;
    pubKey.isPublic = true;
    var publicKey = KEYUTIL.getPEM(pubKey, 'PKCS8PUB');
    publicKey = publicKey.replace(/(\r\n|\n|\r)/gm, '');
    this.globalRegistryRecord.publicKey = publicKey;

    // generate salt
    var saltHashedBitArray = sjcl.hash.sha256.hash(saltWord);
    var salt = sjcl.codec.base64.fromBits(saltHashedBitArray);
    this.globalRegistryRecord.salt = salt;

    // generate GUID
    var iterations = 10000;
    var guidBitArray = sjcl.misc.pbkdf2(this.globalRegistryRecord.publicKey, salt, iterations);
    var guid = sjcl.codec.base64url.fromBits(guidBitArray);
    this.globalRegistryRecord.guid = guid;
}

/**
 * SignGenerates a public/private key pair from a given mnemonic.
 * @returns  {string}     JWT     JSON Web Token ready to commit to Global Registry.
 */
function signGlobalRegistryRecord() {

    var record = this.globalRegistryRecord;
    var recordString = JSON.stringify(record);
    var recordStringBase64 = btoa(recordString);

    var jwtTemp = KJUR.jws.JWS.sign(null, { alg: 'ES256' }, { data: recordStringBase64 }, this._prvKey);
    var encodedString = jwtTemp.split('.').slice(0, 2).join('.');

    var sig = new KJUR.crypto.Signature({ alg: 'SHA256withECDSA' });
    sig.init(this.privateKey);
    sig.updateString(encodedString);

    var signatureHex = sig.sign();
    var signature = btoa(signatureHex);
    var jwt = encodedString + '.' + signature;
    return jwt;
}

function _encodeURL(str){
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

function _decodeUrl(str){
    str = (str + '===').slice(0, str.length + (str.length % 4));
    return str.replace(/-/g, '+').replace(/_/g, '/');
}


function addUserID(userID) {
    // check if already inside
    var found = false;
    for (var i = 0; i < this.globalRegistryRecord.userIDs.length; i++) {
        if (this.globalRegistryRecord.userIDs == userID) {
            found = true;
        }
    }
    if (!found) {
        this.globalRegistryRecord.userIDs.push(userID);
    }
}

/**
 * Removes a UserID for the user.
 * @param  {string}     userID          The UserID to remove.
 */
function removeUserID(userID) {
    for (var i = 0; i < this.globalRegistryRecord.userIDs.length; i++) {
        if (this.globalRegistryRecord.userIDs == userID) {
            this.globalRegistryRecord.userIDs.splice(i, 1);
        }
    }
}

/**
 * Add a contact to the Graph Connector.
 * @param  {string}   guid          GUID of the new contact.
 * @param  {string}   firstName     First name of the new contact.
 * @param  {string}   lastname      Last name of the new contact.
 */
function addContactGC(guid, firstName, lastName) {

    // TODO: what if two contacts have the same GUID?
    // TODO: reject invalid GUIDs

    this.contacts.push(new GraphConnectorContactData(guid, firstName, lastName));
}

/**
 * Remove a contact from the Graph Connector.
 * @param  {string}     guid      GUID of the user to be removed.
 */
function removeContactGC(guid) {
    // remove from contacts
    for (var i = 0; i < this.contacts.length; i++) {
        if (this.contacts[i].guid == guid) {
            this.contacts.splice(i, 1);
        }
    }

    // re-calculate BF1hop
    this.calculateBloomFilter1Hop();
}

/**
 * Calculates the Bloom filter containing all non-private contacts.
 */
function calculateBloomFilter1Hop() {
    var bf = new BloomFilter(
        431328,   // number of bits to allocate. With 30000 entries, we have a false positive rate of 0.1 %.
        10        // number of hash functions.
    );
    for (var i = 0; i < this.contacts.length; i++) {
        if (!this.contacts[i].privateContact) {
            bf.add(this.contacts[i].guid);
        }
    }
    this.contactsBloomFilter1Hop = bf;
    this.lastCalculationBloomFilter1Hop = new Date().toISOString();
}

/**
 * Gets contacts by name.
 * @param  {string}   name    First or last name to look for in the contact list.
 * @returns  {array}   matchingContacts       Contacts matching the given name. The format is: Contacts<GraphConnectorContactData>.
 */
function getContact(name) {
    // TODO: optimize, e.g., find misspelled people
    var rtnArray = [];
    for (var i = 0; i < this.contacts.length; i++) {
        if (this.contacts[i].firstName == name || this.contacts[i].lastName == name) {
            rtnArray.push(this.contacts[i]);
        }
    }
    return rtnArray;
}

/**
 * Checks, if the given GUID is known and returns a list of contacs that are direct connections as well as a list of contacts that (most likely) know the given contact.
 * @param  {string}     guid      GUID of the contact to look for.
 * @returns  {array}    relatedContacts     List of related direct contacts and of related friends-of-friends contacts.The format is: RelatedContacts<Direct<GraphConnectorContactData>,FoF<GraphConnectorContactData>>.
 */
function checkGUID(guid) {
    var directContactsArray = [];
    var fofContactsArray = [];
    for (var i = 0; i < this.contacts.length; i++) {
        if (this.contacts[i].guid == guid) {
            directContactsArray.push(this.contacts[i]);
        }
        var bf1hop = this.contacts[i].contactsBloomFilter1Hop;
        if (bf1hop !== undefined) {
            if (bf1hop.test(guid)) {
                fofContactsArray.push(this.contacts[i]);
            }
        }
    }
    var rtnArray = [];
    rtnArray.push(directContactsArray, fofContactsArray);
    return rtnArray;
}

