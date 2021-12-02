const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Tutoring = require('../models/tutoringClass');
const User = require('../models/user');
const reqAuth = require('../config/safeRoutes').reqAuth;

router.get('/', async (req, res) => {
    let classes = await Tutoring.find();
    let respArray = [];

    classes.forEach(tclass => {
        respArray.push({ id: tclass._id, description: tclass.description,
        teacher_id: tclass.teacher_id, subject: tclass.subject });
    })

    return res.send(respArray);
})

router.get('/:id', async (req, res) => {
    const tclass = await Tutoring.findOne({_id: new mongoose.Types.ObjectId(req.params.id)});

    if (!tclass) {
        console.log('No tutoring class has this id:' + req.params.id);
        return res.status(404).send();
    }

    return res.status(200).send({ id: tclass._id, description: tclass.description,
        teacher_id: tclass.teacher_id, subject: tclass.subject });
})

router.post('/', reqAuth, async (req, res) => {
    const { description, subject, teacher_id } = req.body;

    if (description == undefined || subject == undefined) {
        console.log('Description/subject is undefined');
        return res.status(400).send();
    }

    let teacher = await User.findOne({_id: new mongoose.Types.ObjectId(teacher_id)});

    const tclass = new Tutoring({
        description,
        subject,
        teacher_id
    });

    try {
        await tclass.save();

        let update = teacher.tutoring_classes;
        update.push({id: tclass._id, description: description, subject: subject,
        teacher_id: teacher_id});
        await User.findByIdAndUpdate(teacher_id, {tutoring_classes: update});
        
        return res.status(200).send();
    }
    catch(error) {
        console.log(error.message);
        return res.status(400).send();
    }
})

router.patch('/:id', reqAuth, async (req, res) => {
    try {
        const id = req.params.id; // tutoring class id
        const { description } = req.body;

        const tclass = await Tutoring.findOne({_id: new mongoose.Types.ObjectId(id)});
        if (tclass == null) {
            console.log('No tutoring class has this id:' + id);
            return res.status(404).send();
        }

        if (description == undefined) {
            console.log('Description field is required');
            return res.status(400).send();
        }
        if (description.length > 500) {
            console.log('Description should have max 500 characters');
            return res.status(400).send();
        }

        // update tutoring class
        await Tutoring.findByIdAndUpdate(id, { description });

        const teacher = await User.findOne({_id: new mongoose.Types.ObjectId(req.body.teacher_id)});

        let classesArray = teacher.tutoring_classes;
        classesArray.forEach(elem => {
            if (JSON.stringify(elem.id) === JSON.stringify(tclass._id))
                elem.description = description;
        })

        // update tutoring class in teacher's list
        await User.findByIdAndUpdate(teacher._id, {tutoring_classes: classesArray});

        return res.status(200).send();
    }
    catch(error) {
        console.log(error.message);
        return res.status(500).send();
    }
})

router.delete('/:id', reqAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const tclass = await Tutoring.findOne({_id: new mongoose.Types.ObjectId(id)});

        if (tclass == null) {
            console.log('No tutoring class has this id:' + id);
            return res.status(404).send();
        }

        const teacher_id = tclass.teacher_id;
        const teacher = await User.findOne({_id: new mongoose.Types.ObjectId(teacher_id)});
        let classesArray = teacher.tutoring_classes;
        let index = -1;

        classesArray.forEach(elem => {
            if (JSON.stringify(elem.id) === JSON.stringify(tclass._id))
                index = classesArray.indexOf(elem);
        })

        classesArray.splice(index, 1); // remove tutoring class from list

        // update teacher's list
        await User.findByIdAndUpdate(teacher_id, {tutoring_classes: classesArray});

        // delete the tutoring class from the db
        await Tutoring.findByIdAndDelete(id);

        return res.status(200).send();
    }
    catch(error) {
        console.log(error.message);
        return res.status(500).send();
    }
})

module.exports = router;