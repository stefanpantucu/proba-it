const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); // makes all routes secure

// compresses response bodies for all requests
const compression = require('compression'); 

const mongoURI = require('./config/keys').mongoURI;

// configure .env
require('dotenv').config();

const app = express();

app.use(compression());

// connect to the database
mongoose
    .connect(mongoURI,
        async(err)=>{
            if(err) throw err;
            console.log("MONGO connected")
        });

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// initialize routes

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log('App listening on port ' + PORT + '! Go to https://localhost:'
    + PORT + '/');
});

app.enable('trust proxy');

app.use(function(req, res, next) {
    if (req.secure) {
        return next();
    }

    res.redirect('https://' + req.headers.host + req.url);
})
