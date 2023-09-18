const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const feedRoutes = require('./router/feed.js');
const { error } = require('console');

const MONGODB_URI =
  "mongodb+srv://denys:295q6722822@cluster0.fk2cpgo.mongodb.net/messages?retryWrites=true&w=majority";

const app = express();

// app.use(bodyParser.urlencoded()) // for x-www-form <form> format
app.use(bodyParser.json()); // application/json
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use((req, res, next)=> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes); 

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode;
    const message = error.message;
    res.status(status).join({message: message});
});

mongoose.connect(MONGODB_URI)
    .then(result => {
        console.log(path.join(__dirname, 'images'));
        app.listen(8080);
    })
    .catch((err) => {
        console.log(err);
      });