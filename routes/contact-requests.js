const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const contactModel = require('../models/contact-requests');

router.post('/contact-requests', async (req, res) => {
    const {name, email, message} = req.body;
    const contactRequest = new contactModel({
        name,
        email,
        message
    });

    try {
        await contactRequest.save();
        return res.status(201).send();
    }
    catch(error) {
        console.log('Invalid request format!' + error);
        return res.status(400).send();
    }
})

module.exports = router;