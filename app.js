const express = require('express');

const feedRoutes = require('./router/feed.js');

const app = express();

app.use('/feed', feedRoutes); // GET /feed/posts


app.listen(8080);