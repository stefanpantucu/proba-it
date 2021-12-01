const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/review');
const User = require('../models/user');

router.get('/', async (req, res) => {
    let reviewsArray = await Review.find();
    let respArray = []

    reviewsArray.forEach(rev => {
        respArray.push({id: rev._id, message: rev.message, user_id: rev.user_id});
    })

    res.send(respArray);
})

router.get('/:id', async (req, res) => {
    const review = await Review.findOne({_id: new mongoose.Types.ObjectId(req.params.id)});

    if (!review) {
        console.log('No review has that id:' + req.params.id);
        return res.status(404).send();
    }

    return res.status(200).send({ id: review._id, message: review.message,
            user_id: review.user_id });
})

router.post('/', async (req, res) => {
    const { message, user_id } = req.body;

    if (message == undefined || user_id == undefined) {
        console.log('Message/user_id is undefined');
        return res.status(400).send();
    }

    const review = new Review({
        message,
        user_id
    });

    let rev_id = review._id;
    console.log(rev_id);

    const user = await User.findOne({_id: new mongoose.Types.ObjectId(user_id)});

    if (!user) {
        console.log('No user has that id:' + user_id);
        return res.status(404).send();
    }

    try {
        await review.save();

        let update = user.reviews;
        update.push({id: rev_id, message: message, user_id: user_id});
        await User.findByIdAndUpdate(user_id, {reviews: update});
        
        return res.status(200).send();
    }
    catch(error) {
        console.log(error.message);
        return res.status(400).send();
    }
})

router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id; // get review id
        const { message } = req.body;

        if (message == undefined) {
            console.log('Message field is required');
            return res.status(400).send();
        }

        const review = await Review.findOne({_id: new mongoose.Types.ObjectId(id)});
        const result = await Review.findByIdAndUpdate(id, {message});
        const user = await User.findOne({_id: new mongoose.Types.ObjectId(review.user_id)});

        if (result == null) {
            console.log('No review has this id:' + id);
            return res.status(404).send();
        }

        let reviewsArray = user.reviews;
        reviewsArray.forEach(rev => {
            
            if (JSON.stringify(rev.id) === JSON.stringify(review._id)) {
                rev.message = message;
            }
        })

        await User.findByIdAndUpdate(user._id, {reviews: reviewsArray});

        return res.status(200).send({message: message});
    }
    catch(error) {
        console.log(error.message);
        return res.status(500).send();
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const review = await Review.findOne({_id: new mongoose.Types.ObjectId(id)});
        let user_id = 0;

        if (review != null) {
            user_id = review.user_id;

            const user = await User.findOne({_id: new mongoose.Types.ObjectId(user_id)});
            let reviewsArray = user.reviews;
            let index = -1;
            reviewsArray.forEach(rev => {
                
                if (JSON.stringify(rev.id) === JSON.stringify(review._id)) {
                    index = reviewsArray.indexOf(rev);
                }
            })

            reviewsArray.splice(index, 1); // remove review from the user's list

            await User.findByIdAndUpdate(user_id, {reviews: reviewsArray});
        }
        const result = await Review.findByIdAndDelete(id);

        if (result == null) {
            console.log('No review has this id:' + id);
            return res.status(404).send();
        }

        return res.status(200).send();
    }
    catch(error) {
        console.log(error.message);
        return res.status(500).send();
    }
})

module.exports = router;