// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var appSchema = mongoose.Schema({
    contactlist:
    {
        mail: String,
        firstname: String,
        lastname: String,
        info: String,
        guid: String, 
        associatedUser: String,
        uids: String
    }

});

module.exports = mongoose.model('UserApp', appSchema);