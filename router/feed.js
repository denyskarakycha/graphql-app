const express = require('express');
const router = express.Router();

const feedController = require('../controllers/feed.js');

router.post('/posts', feedController.getPosts);

module.exports = router;