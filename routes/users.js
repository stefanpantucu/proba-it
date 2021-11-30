const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs'); // for password encryption
const jwt = require('jsonwebtoken');
const config = require('../config/keys');
const ActiveSession = require('../models/activeSession');

function validate_email(email, role) {
    let teacher = /^\w+([\.-]?\w+)*\@onmicrosoft.upb.ro/;
    let student = /^\w+([\.-]?\w+)*\@stud.upb.ro/;

    if (role == "student" && !(student.test(email))) {
        console.log("Student email should be ending in @stud.upb.ro");
        return false;
    }
    if (role == "teacher" && !(teacher.test(email))) {
        console.log("Teacher email should be ending in @onmicrosoft.upb.ro");
        return false;
    }

    return true;
}

router.post('/register', (req, res) => {
    const { firstname, lastname, password, email,
        role, confirmation_password} = req.body;
    
    if (typeof firstname != typeof '' || typeof lastname != typeof '' ||
        typeof password != typeof '' || typeof email != typeof '' ||
        typeof role != typeof '' || typeof confirmation_password != typeof '') {
            console.log("One of the fields has an inappropriate data type");
            return res.status(400).send();
    }
    
    if (!validate_email(email, role))
        return res.status(400).send();

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

router.get('/', async (req, res) => {
    let userArray = await User.find();
    let respArray = [];

    userArray.forEach(user => {
        respArray.push({ id: user._id, email:user.email, firstname: user.firstname,
        lastname: user.lastname, role: user.role })
    })

    res.send(respArray);
})

router.get('/:id', async (req, res) => {
    const user = await User.findOne({_id: new mongoose.Types.ObjectId(req.params.id)});

    if (!user) {
        console.log('No user has that id:' + req.params.id);
        return res.status(404).send();
    }
    return res.send({ id: user._id, email:user.email, firstname: user.firstname,
        lastname: user.lastname, role: user.role });
})

router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id; // get user id
        const user = await User.findOne({_id: new mongoose.Types.ObjectId(id)});

        if (!user) {
            console.log('No user has that id:' + req.params.id);
            return res.status(404).send();
        }

        const { email, password, confirmation_password } = req.body;
        let update = req.body;

        if ((password != undefined && confirmation_password == undefined) ||
            (password == undefined && confirmation_password != undefined)) {
            return res.status(400).send('Both password and confirmation password' +
            ' must be provided!');
        }

        // if the password is to be changed, hash it
        if (password != undefined && confirmation_password != undefined) {
            if (password !== confirmation_password)
                return res.status(400).send('Password and confirmation password' +
                ' should be the same');
            
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, null, (err, hash) => {
                        if (err) {
                            console.log("bcrypt error");
                            return res.status(500).send();
                        }
                        update.password = hash; // put the hashed password
                    })
                });
        }


        // email validation
        if (email != undefined) {
            if (!validate_email(email, user.role))
                return res.status(400).send();

            await User.findOne({ email: email }, function(err, user) {
                if (user) {
                    console.log('Email is already used.');
                    return res.status(400).send();
                }}).clone();
        }
    
        await User.findByIdAndUpdate(id, update);

        return res.status(200).send();
    }
    catch(error) {
        console.log(error.message);
        return res.status(500);
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const result = await User.findByIdAndDelete(id);

        if (result == null) {
            console.log('Can\'t delete user:' + req.params.id + '\nno user found');
            return res.status(404).send();
        }

         return res.status(200).send();
    }
    catch(error) {
        console.log(error.message);
        res.status(500).send();
    }

})

module.exports = router;