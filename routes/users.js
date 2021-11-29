const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs'); // for password encryption
const jwt = require('jsonwebtoken');
const config = require('../config/keys');
const ActiveSession = require('../models/activeSession');

router.post('/register', (req, res) => {
    const { firstname, lastname, password, email,
        role, confirmation_password} = req.body;
    
    if (typeof firstname != typeof '' || typeof lastname != typeof '' ||
        typeof password != typeof '' || typeof email != typeof '' ||
        typeof role != typeof '' || typeof confirmation_password != typeof '') {
            console.log("One of the fields has an inappropriate data type");
            return res.status(400).send();
    }
    
    let teacher = /^\w+([\.-]?\w+)*\@onmicrosoft.upb.ro/;
    let student = /^\w+([\.-]?\w+)*\@stud.upb.ro/;

    if (role == "student" && !(student.test(email))) {
        console.log(email);
        return res.status(400).send("Student email should be ending in @stud.upb.ro");
    }
    if (role == "teacher" && !(teacher.test(email))) {
        return res.status(400).send("Student email should be ending in @onmicrosoft.upb.ro");
    }


    if (password.length > 50) {
        return res.status(400).send("Password can't be longer than 50 characters.");
    }
    
    if (password != confirmation_password) {
        return res.status(400).send('Confirmation password should be' +
        ' the same as password.');
    }

    User.findOne({ email: email }, function(err, user) {
        if (user) {
            return res.status(400).send({success: false, msg: 'User already exists.'});
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, null, (err, hash) => {
                    if (err) {
                        console.log("bcrypt error");
                        return res.status(400).send({success: false});
                    }
                    const user = { firstname: firstname, lastname: lastname,
                        email: email, password: hash, role: role };

                    User.create(user, function (err, user) {
                        if (err) {
                            return res.status(400).send();
                        }
                        return res.json({success: true});
                    })
                })
            })
        }
    })
})

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (typeof email != typeof '' || typeof password != typeof '') {
        console.log('email or password is not of string type');
        return res.status(400).send();
    }

    User.findOne({email: email}, (err, user) => {
        if (err) {
            return res.status(400).send({success: false});
        }

        if (!user) {
            console.log('User doesn\'t exist');
            return res.status(400).send({success: false}); // User doesn't exist
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (isMatch) {
                //generate token that expires in 1 week
                const token = jwt.sign({user}, config.secret, {expiresIn: 86400});
                user.password = null;
                
                const session = {userId: user._id, token: 'JWT ' + token};
                ActiveSession.create(session, (err, resp) => {
                    return res.json({success: true, token: 'JWT ' + token, user: user._id});
                });

            }
            else {
                return res.status(401).send('Wrong credentials');
            }
        })
    })
})

// router.get()


module.exports = router;