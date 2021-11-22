const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const contactModel = require('../models/contact-requests');

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if ((typeof name !== String) || (typeof message !== String) ||
        (typeof email !== String)) {
        console.log('Invalid data type');
        return res.status(400).send();
    }

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
        console.log('Invalid request format!\n' + error);
        return res.status(400).send();
    }
})

module.exports = router;