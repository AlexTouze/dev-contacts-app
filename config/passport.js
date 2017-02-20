// config/passport.js
var passport = require('passport');
// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt
var btoa = require('btoa')
// load up the user model
var User = require('../models/userLocal');

// =========================================================================
// passport session setup ==================================================
// =========================================================================
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// =========================================================================
// LOCAL SIGNUP ============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
},
    function (req, email, password, done) {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email': email }, function (err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser = new User();

                // set the user's local credentials
                newUser.local.guid = "";
                newUser.local.prvKey = "";
                newUser.local.privateKey = "";
                newUser.local.email = email;
                newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model

                // save the user
                newUser.save(function (err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });

    }));

// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
},
    function (req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email': email }, function (err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

// =========================================================================
// JWT =====================================================================
// =========================================================================
passport.use(new JwtStrategy({

    jwtFromRequest: ExtractJwt.fromUrlQueryParameter('jwt'),
    keyInHeader: true,
    // TODO issuer must not be set, but instead iss must match jku domain
    //issuer : 'https://192.168.99.100:8080',
    algorithms: ['RS256'],
    passReqToCallback: true

},
    function (req, jwt_payload, done) {
        console.log('Verify function')
        console.log(jwt_payload)
        // asynchronous
        process.nextTick(function () {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'jwt.id': jwt_payload.sub }, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.jwt.token) {
                            user.jwt.token = btoa(JSON.stringify(jwt_payload));

                            user.save(function (err) {
                                if (err)
                                    return done(err);
                                console.log("Alt1")
                                return done(null, user);
                            });
                        }

                        console.log("Alt2")
                        return done(null, user);
                    } else {
                        var newUser = new User();

                        newUser.jwt.id = jwt_payload.sub;
                        newUser.jwt.token = btoa(JSON.stringify(jwt_payload));
                        newUser.jwt.iss = jwt_payload.sub;
 			            newUser.local.guid = "";
                        newUser.local.email = newUser.jwt.id;
                        newUser.save(function (err) {
                            if (err)
                                return done(err);

                            console.log("Alt3")
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user; // pull the user out of the session

                user.jwt.id = jwt_payload.id;
                user.jwt.token = btoa(JSON.stringify(jwt_payload));
                user.jwt.iss = jwt_payload.iss;

                user.save(function (err) {
                    if (err)
                        return done(err);

                    console.log("Alt4")
                    return done(null, user);
                });

            }
        });
    }));

module.exports = passport;

