/**
 * Constructs a new empty object.
 */
var Record = function () {
    this.guid = "";
    this.salt = "";
    this.userIDs = [];
    this.lastUpdate = "";
    this.timeout = "";
    this.publicKey= "";
    this.active= "";
    this.revoked= "";
    this.schemaVersion = "1";
    this.defaults = [];
}

function getRecord() {
    return new Record();
}


