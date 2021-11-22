const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); // makes all routes secure
const contactRequests = require('./routes/contact-requests');

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

const PORT = process.env.PORT;

app.enable('trust proxy');

// initialize routes
app.use('/api/contact-requests', contactRequests);

app.listen(PORT, () => {
    console.log('App listening on port ' + PORT + '! Go to http://localhost:'
    + PORT + '/');
});


