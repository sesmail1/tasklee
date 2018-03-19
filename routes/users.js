// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Homepage
//// Registration Page
router.get('/register', (req, res) => {
    res.render('register');
});
//// Login Page
router.get('/login', (req, res) => {
    res.render('login');
});

//// Register User
router.post('/register', (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Form Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    // Store Errors
    var errors = req.validationErrors();

    // Moving forward + Catching Errors
    
    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password,
        });

        User.createUser(newUser, (err, user) => {
            if (err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'You have successfuly registered.');

        res.redirect('/users/login');
    }

});

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, (err, user) => {
            if (err) throw err;
            if (!user) {
                return done(null, false, {
                    message: 'Unknown User'
                });
            }

            User.comparePassword(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    function (req, res) {
        res.redirect('/');
    });

router.get('/logout', (req, res) => {
    req.logout();

    req.flash('success_msg', 'You have successfuly logged out.');
    res.redirect('/');
});

//// Send Data


module.exports = router;