const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const config = require('./keys');

module.exports = function(passport) {
    const opts = {};

    // extracts the token from the request header
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    opts.secretOrKey = config.secret;

    passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
        User.findById(jwtPayload._doc._id, (err, user) => {
            if (err) {
                return done(err, false);
            }
            
            if (user) {
                return done(null, user); // no error, user found
            }
            else {
                return done(null, false); // no err, user not found
            }
        })
    }))
}