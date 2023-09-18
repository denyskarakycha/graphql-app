const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const feedRoutes = require('./router/feed.js');

const MONGODB_URI =
  "mongodb+srv://denys:295q6722822@cluster0.fk2cpgo.mongodb.net/messages?retryWrites=true&w=majority";

const app = express();

// app.use(bodyParser.urlencoded()) // for x-www-form <form> format
app.use(bodyParser.json()); // application/json


app.use((req, res, next)=> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes); 

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(8080);
    })
    .catch((err) => {
        console.log(err);
      });