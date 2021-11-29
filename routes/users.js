const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs'); // for password encryption
const jwt = require('jsonwebtoken');
const config = require('../config/keys');

router.post('/register', (req, res) => {
    const { firstname, lastname, password, email,
        role, confirmation_password} = req.body;
    
    if (typeof firstname != typeof '' || typeof lastname != typeof '' ||
        typeof password != typeof '' || typeof email != typeof '' ||
        typeof role != typeof '' || typeof confirmation_password != typeof '') {
            return res.status(400).send();
    }
    
    var teacher = /^\w+([\.-]?\w+)*@\onmicrosoft.upb.ro/;
    var student = /^\w+([\.-]?\w+)*@\stud.acs.upb.ro/;

    if (role == "student" && !(student.test(email))) {
        return res.status(400).send();
    }
    
    if (role == "teacher" && !(teacher.test(email))) {
        return res.status(400).send();
    }


    if (password.length > 50) {
        return res.status(400).send("Password can't be longer than 50 characters.");
    }
    
    if (password != confirmation_password) {
        return res.status(400).send({success: false, msg: 'Confirmation password should be' +
        ' the same as password.'});
    }

    User.findOne({ email: email }, function(err, user) {
        if (user) {
            return res.status(400).send({success: false, msg: 'User already exists.'});
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, null, (err, hash) => {
                    if (err) {
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
        return res.status(400).send();
    }

    User.findOne({email: email}, (err, user) => {
        if (err) {
            return res.status(400).send({success: false});
        }

        if (!user) {
            return res.status(400).send({success: false}); // User doesn't exist
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (isMatch) {
                //generate token that expires in 1 week
                const token = jwt.sign({user}, config.secret, {expiresIn: 86400});
                return res.json({token: 'JWT ' + token});
            }
            else {
                return res.json({success: false, msg: 'Wrong credentials'}).status(401).send();
            }
        })
    })
})


module.exports = router;