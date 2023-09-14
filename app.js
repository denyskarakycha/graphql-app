const express = require('express');
const bodyParser = require('body-parser');


const feedRoutes = require('./router/feed.js');

const app = express();


// app.use(bodyParser.urlencoded()) // for x-www-form <form> format
app.use(bodyParser.json()); // application/json

app.use('/feed', feedRoutes); // GET /feed/posts


app.listen(8080);