const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const contactModel = require('../models/contact-requests');

router.get('/', async (req, res) => {
    var contactArray = await contactModel.find();

    res.send(contactArray);
})

router.get('/:id', async (req, res) => {
    console.log(req.params.id);

    const contactRequest = await contactModel.findOne({_id: new mongoose.Types.ObjectId(req.params.id)});
    return res.send(contactRequest);
})

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if ((typeof name !== typeof '') || (typeof message !== typeof '') ||
        (typeof email !== typeof '')) {
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

router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id; // get object id
        const { is_resolved } = req.body;


        if (typeof is_resolved != typeof true)
            return res.status(400).send(); // is_resolved is not boolean

        const result = await contactModel.findByIdAndUpdate(id, {is_resolved});

        if (result == null)
            return res.status(404).send();

        return res.send(result);
    }
    catch(error) {
        console.log(error.message);
        res.status(404).send();
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id; // get object id

        const result = await contactModel.findByIdAndDelete(id);

        if (result == null)
            return res.status(404).send();

        return res.send(result);
    }
    catch(error) {
        console.log(error.message);
        res.status(404).send();
    }
})

module.exports = router;