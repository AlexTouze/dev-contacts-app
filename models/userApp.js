// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var appSchema = mongoose.Schema({
    contactlist:
    {
        mail: String,
        password: String,
        firstname: String,
        lastname: String,
        age: String,
        guid: String
    }

});

module.exports = mongoose.model('UserApp', appSchema);