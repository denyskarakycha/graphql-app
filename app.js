const express = require('express');
const bodyParser = require('body-parser');


const feedRoutes = require('./router/feed.js');

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


app.listen(8080);